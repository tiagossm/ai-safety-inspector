
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
import { InspectionQuestion } from "../InspectionQuestion";
import { ActionPlan } from "@/services/inspection/actionPlanService";
import { ActionPlanFormData } from "@/components/action-plans/form/types";

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
  setResponses: (data: Record<string, any>) => void;
  onResponseChange?: (questionId: string, data: any) => void;
  onMediaChange?: (questionId: string, mediaUrls: string[]) => void;
  onMediaUpload?: (questionId: string, file: File) => Promise<string | null>;
  onSaveSubChecklistResponses: (subChecklistId: string, responses: Record<string, any>) => Promise<void>;
  plansByQuestion?: Record<string, ActionPlan>;
  onSaveActionPlan?: (data: ActionPlanFormData) => Promise<ActionPlan | void>;
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
  setResponses,
  onResponseChange,
  onMediaChange,
  onMediaUpload,
  onSaveSubChecklistResponses,
  plansByQuestion = {},
  onSaveActionPlan
}: InspectionLayoutProps) {
  const DEFAULT_GROUP = { id: "default-group", title: "Perguntas", order: 0 };
  const displayGroups = groups.length > 0 ? groups : [DEFAULT_GROUP];
  const effectiveCurrentGroupId = currentGroupId || (displayGroups.length > 0 ? displayGroups[0].id : null);

  const handleQuestionResponseChange = (questionId: string, data: any) => {
    console.log("Changing response for question:", questionId, data);
    
    // Certifique-se de preservar mediaUrls no response atual
    const currentResponse = responses[questionId] || {};
    const mediaUrls = data.mediaUrls || currentResponse.mediaUrls || [];
    
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        ...data,
        mediaUrls: mediaUrls
      }
    }));
    
    // Se onResponseChange estiver definido, chame-o
    if (onResponseChange) {
      onResponseChange(questionId, {
        ...data,
        mediaUrls: mediaUrls
      });
    }
    
    // Se onMediaChange estiver definido e houver mudanças nas mediaUrls, chame-o
    if (onMediaChange && data.mediaUrls) {
      onMediaChange(questionId, data.mediaUrls);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8">Carregando...</div>
    );
  }

  if (!inspection) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-base font-medium">Inspeção não encontrada</AlertTitle>
          <AlertDescription className="mt-2">
            Não foi possível carregar os dados da inspeção.
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
              {filteredQuestions.length > 0 ? (
                <div className="space-y-6">
                  {filteredQuestions.map((question, index) => (
                    <InspectionQuestion
                      key={question.id}
                      question={question}
                      index={index}
                      response={responses[question.id] || {}}
                      onResponseChange={(data) => handleQuestionResponseChange(question.id, data)}
                      allQuestions={questions}
                      numberLabel={`${index + 1}`}
                      inspectionId={inspection.id}
                      actionPlan={plansByQuestion?.[question.id]}
                      onSaveActionPlan={onSaveActionPlan}
                    />
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
