
import React from "react";
import { InspectionHeader } from "@/components/inspection/InspectionHeader";
import { QuestionGroups } from "@/components/inspection/QuestionGroups";
import { QuestionsPanel } from "@/components/inspection/QuestionsPanel";
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
  const defaultGroup = {
    id: "default-group",
    title: "Perguntas",
    order: 0
  };
  
  // Garantir que sempre existe pelo menos um grupo
  const displayGroups = groups.length > 0 ? groups : [defaultGroup];
  
  // Definir currentGroupId se não estiver definido
  const effectiveCurrentGroupId = currentGroupId || (displayGroups.length > 0 ? displayGroups[0].id : null);
  
  // Filter questions by current group, handling null groupId values
  const questionsInCurrentGroup = effectiveCurrentGroupId
    ? questions.filter(q => q.groupId === effectiveCurrentGroupId || 
                          (q.groupId === null && effectiveCurrentGroupId === 'default-group'))
    : [];

  // Log the filtered questions for debugging
  console.log(`Layout: Questions in group ${effectiveCurrentGroupId}: ${questionsInCurrentGroup.length} of ${questions.length} total`);
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
            <QuestionsPanel
              loading={loading}
              currentGroupId={effectiveCurrentGroupId}
              filteredQuestions={questionsInCurrentGroup}
              questions={questions}
              responses={responses}
              groups={displayGroups}
              onResponseChange={onResponseChange}
              onSaveSubChecklistResponses={onSaveSubChecklistResponses}
              subChecklists={subChecklists}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
