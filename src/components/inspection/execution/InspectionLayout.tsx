
import React, { useState, useEffect } from "react";
import { InspectionHeader } from "@/components/inspection/InspectionHeader";
import { QuestionGroups } from "@/components/inspection/QuestionGroups";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionButtons } from "./ActionButtons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { FloatingActionButtons } from "./FloatingActionButtons";
import { ResponseInputRenderer } from "../question-parts/ResponseInputRenderer";

interface InspectionLayoutProps {
  loading: boolean;
  inspection: any;
  company: any;
  responsible: any;
  questions: any[];
  responses: Record<string, any>;
  groups: any[];
  subChecklists: Record<string, any>;
  currentGroupId: string | null;
  filteredQuestions: any[];
  stats: any;
  saving: boolean;
  autoSave: boolean;
  lastSaved: Date | null;
  setAutoSave: (value: boolean) => void;
  setCurrentGroupId: (id: string) => void;
  onSaveProgress: () => Promise<void>;
  onCompleteInspection: () => Promise<void>;
  onReopenInspection: () => Promise<void>;
  onViewActionPlan: () => Promise<void>;
  onGenerateReport: () => Promise<void>;
  refreshData: () => void;
  onResponseChange: (questionId: string, value: any, additionalData?: any) => void;
  onMediaChange?: (questionId: string, mediaUrls: string[]) => void;
  onMediaUpload?: (questionId: string, file: File) => Promise<string | null>;
  onSaveSubChecklistResponses: (subChecklistId: string, responses: Record<string, any>) => Promise<void>;
}

export function InspectionLayout({
  loading,
  inspection,
  company,
  responsible,
  questions,
  responses,
  groups,
  subChecklists,
  currentGroupId,
  filteredQuestions,
  stats,
  saving,
  autoSave,
  lastSaved,
  setAutoSave,
  setCurrentGroupId,
  onSaveProgress,
  onCompleteInspection,
  onReopenInspection,
  onViewActionPlan,
  onGenerateReport,
  refreshData,
  onResponseChange,
  onMediaChange,
  onMediaUpload,
  onSaveSubChecklistResponses
}: InspectionLayoutProps) {
  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Set up auto-save
  useEffect(() => {
    if (autoSave && !autoSaveTimer) {
      const timer = setInterval(() => {
        console.log("Auto-saving inspection responses...");
        onSaveProgress();
      }, 60000); // Auto-save every minute
      
      setAutoSaveTimer(timer);
    } else if (!autoSave && autoSaveTimer) {
      clearInterval(autoSaveTimer);
      setAutoSaveTimer(null);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [autoSave, autoSaveTimer, onSaveProgress]);

  // Definir grupo padrão se não houver nenhum
  const DEFAULT_GROUP = {
    id: "default-group",
    title: "Perguntas",
    order: 0
  };
  
  // Garantir que sempre existe pelo menos um grupo
  const displayGroups = groups.length > 0 ? groups : [DEFAULT_GROUP];
  
  // Definir currentGroupId se não estiver definido
  const effectiveCurrentGroupId = currentGroupId || (displayGroups.length > 0 ? displayGroups[0].id : null);
  
  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="mb-4">
          <Skeleton className="h-7 w-2/3 max-w-md mb-1" />
          <Skeleton className="h-4 w-1/3 max-w-xs" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="p-4">
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full" />
            </Card>
          </div>
          
          <div className="md:col-span-3">
            <Card className="p-4">
              <Skeleton className="h-6 w-1/3 mb-6" />
              <div className="space-y-8">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base font-medium">Inspeção não encontrada</AlertTitle>
          <AlertDescription className="mt-2">
            Não foi possível carregar os dados da inspeção. Tente novamente mais tarde ou contate o suporte.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isInspectionCompleted = inspection.status === "Concluída" || inspection.status === "Completed";
  
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <InspectionHeader loading={loading} inspection={inspection} />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="p-4">
            <ActionButtons
              loading={loading}
              saving={saving}
              autoSave={autoSave}
              setAutoSave={setAutoSave}
              lastSaved={lastSaved}
              inspectionStatus={inspection?.status}
              completionPercentage={stats.completionPercentage}
              onSaveProgress={onSaveProgress}
              onCompleteInspection={onCompleteInspection}
              onReopenInspection={onReopenInspection}
              onViewActionPlan={onViewActionPlan}
              onGenerateReport={onGenerateReport}
              refreshData={refreshData}
            />
          </Card>
          
          <Card>
            <ScrollArea className="h-[calc(100vh-350px)]">
              <QuestionGroups 
                groups={displayGroups}
                currentGroupId={effectiveCurrentGroupId}
                onGroupChange={setCurrentGroupId}
                stats={stats}
              />
            </ScrollArea>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">
                {groups.find(g => g.id === effectiveCurrentGroupId)?.title || "Perguntas"}
              </h3>
              
              {filteredQuestions.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuestions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2 flex justify-between">
                        <span>{index + 1}. {question.pergunta || question.text}</span>
                        <div className="flex items-center gap-1">
                          {question.permite_foto && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              Foto
                            </span>
                          )}
                          {question.permite_video && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              Vídeo
                            </span>
                          )}
                          {question.permite_audio && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                              Áudio
                            </span>
                          )}
                          {question.obrigatorio && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                              Obrigatório
                            </span>
                          )}
                        </div>
                      </h4>
                      
                      <div className="mt-3">
                        <ResponseInputRenderer 
                          question={question}
                          response={responses[question.id]}
                          onResponseChange={(value) => onResponseChange(question.id, value)}
                          onMediaChange={onMediaChange ? (urls) => onMediaChange(question.id, urls) : undefined}
                        />
                      </div>
                      
                      {/* Comment section */}
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-600 mb-1">Comentário:</p>
                        <textarea
                          className="w-full border rounded p-2 text-sm"
                          rows={2}
                          placeholder="Adicione um comentário (opcional)"
                          value={responses[question.id]?.comment || ''}
                          onChange={(e) => onResponseChange(
                            question.id, 
                            responses[question.id]?.value,
                            { comment: e.target.value }
                          )}
                          disabled={isInspectionCompleted}
                        />
                      </div>
                      
                      {/* Action plan section (for negative answers) */}
                      {(responses[question.id]?.value === 'não' || responses[question.id]?.value === 'no') && (
                        <div className="mt-3 pt-2 border-t border-dashed">
                          <p className="text-sm font-medium text-red-600 mb-1">Plano de Ação:</p>
                          <textarea
                            className="w-full border border-red-200 bg-red-50 rounded p-2 text-sm"
                            rows={2}
                            placeholder="Descreva a ação corretiva necessária"
                            value={responses[question.id]?.actionPlan || ''}
                            onChange={(e) => onResponseChange(
                              question.id, 
                              responses[question.id]?.value,
                              { actionPlan: e.target.value }
                            )}
                            disabled={isInspectionCompleted}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Nenhuma pergunta disponível neste grupo
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Floating action buttons */}
      <FloatingActionButtons 
        saving={saving}
        autoSave={autoSave}
        onSave={onSaveProgress}
        onComplete={onCompleteInspection}
        isCompleted={isInspectionCompleted}
        onReopen={onReopenInspection}
        onRefresh={refreshData}
      />
    </div>
  );
}
