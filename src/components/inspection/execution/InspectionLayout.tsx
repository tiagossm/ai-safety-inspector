
import React from "react";
import { InspectionHeader } from "@/components/inspection/InspectionHeader";
import { QuestionGroups } from "@/components/inspection/QuestionGroups";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionButtons } from "./ActionButtons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  onSaveSubChecklistResponses
}: InspectionLayoutProps) {
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

  // Log para debug
  console.log(`Layout: Questions in group ${effectiveCurrentGroupId}: ${filteredQuestions.length} of ${questions.length} total`);
  console.log('Group IDs distribution:', questions.reduce((acc, q) => {
    const key = q.groupId || 'null';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}));
  
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
                        {question.obrigatorio && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                            Obrigatório
                          </span>
                        )}
                      </h4>
                      
                      <div className="mt-3">
                        {/* Simple response input based on type */}
                        {(question.tipo_resposta === 'yes_no' || question.responseType === 'yes_no') ? (
                          <div className="flex gap-2">
                            <button
                              className={`px-3 py-1 rounded text-sm ${
                                responses[question.id]?.value === 'sim' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-100'
                              }`}
                              onClick={() => onResponseChange(question.id, 'sim')}
                            >
                              Sim
                            </button>
                            <button
                              className={`px-3 py-1 rounded text-sm ${
                                responses[question.id]?.value === 'não' 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-gray-100'
                              }`}
                              onClick={() => onResponseChange(question.id, 'não')}
                            >
                              Não
                            </button>
                            <button
                              className={`px-3 py-1 rounded text-sm ${
                                responses[question.id]?.value === 'n/a' 
                                  ? 'bg-gray-500 text-white' 
                                  : 'bg-gray-100'
                              }`}
                              onClick={() => onResponseChange(question.id, 'n/a')}
                            >
                              N/A
                            </button>
                          </div>
                        ) : (
                          <textarea
                            className="w-full border rounded p-2 text-sm"
                            rows={3}
                            placeholder="Digite sua resposta..."
                            value={responses[question.id]?.value || ''}
                            onChange={(e) => onResponseChange(question.id, e.target.value)}
                          />
                        )}
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
                        />
                      </div>
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
    </div>
  );
}
