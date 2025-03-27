
import React from "react";
import { InspectionHeader } from "@/components/inspection/InspectionHeader";
import { InspectionDetailsCard } from "@/components/inspection/InspectionDetails";
import { InspectionCompletion } from "@/components/inspection/InspectionCompletion";
import { QuestionGroups } from "@/components/inspection/QuestionGroups";
import { QuestionsPanel } from "@/components/inspection/QuestionsPanel";
import { ActionButtons } from "./ActionButtons";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  stats: { percentage: number; answered: number; total: number };
  saving: boolean;
  autoSave: boolean;
  lastSaved: Date | null;
  setAutoSave: (value: boolean) => void;
  setCurrentGroupId: (groupId: string) => void;
  onSaveProgress: () => Promise<void>;
  onCompleteInspection: () => Promise<void>;
  onReopenInspection: () => Promise<void>;
  onViewActionPlan: () => void;
  onGenerateReport: () => void;
  refreshData: () => void;
  onResponseChange: (questionId: string, data: any) => void;
  onSaveSubChecklistResponses: (questionId: string, responses: any[]) => void;
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
  const getStatusLabel = (status?: string) => {
    switch(status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em andamento';
      case 'completed': return 'Concluído';
      default: return 'Desconhecido';
    }
  };

  const filteredQuestions = questions.filter(q => q.groupId === currentGroupId);

  return (
    <div className="container py-4 max-w-7xl mx-auto">
      <InspectionHeader 
        loading={loading} 
        inspection={{
          ...inspection,
          statusLabel: getStatusLabel(inspection?.status)
        }} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <InspectionDetailsCard 
            loading={loading} 
            inspection={inspection} 
            company={company} 
            responsible={responsible}
            onRefresh={refreshData}
          />
          
          <InspectionCompletion loading={loading} stats={stats} />
          
          {groups.length > 0 && (
            <QuestionGroups 
              groups={groups} 
              currentGroupId={currentGroupId} 
              onGroupChange={setCurrentGroupId} 
            />
          )}
          
          <ActionButtons
            loading={loading}
            saving={saving}
            autoSave={autoSave}
            setAutoSave={setAutoSave}
            lastSaved={lastSaved}
            inspectionStatus={inspection?.status}
            completionPercentage={stats.percentage}
            onSaveProgress={onSaveProgress}
            onCompleteInspection={onCompleteInspection}
            onReopenInspection={onReopenInspection}
            onViewActionPlan={onViewActionPlan}
            onGenerateReport={onGenerateReport}
            refreshData={refreshData}
          />
        </div>
        
        <div className="lg:col-span-3">
          <QuestionsPanel 
            loading={loading}
            currentGroupId={currentGroupId}
            filteredQuestions={filteredQuestions}
            questions={questions}
            responses={responses}
            groups={groups}
            onResponseChange={onResponseChange}
            onSaveSubChecklistResponses={onSaveSubChecklistResponses}
            subChecklists={subChecklists}
          />
          
          {!loading && questions.length === 0 && (
            <Alert className="mt-3">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <AlertTitle className="text-sm font-medium">Sem perguntas disponíveis</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed">
                Não foram encontradas perguntas para este checklist.
                Tente atualizar os dados ou verifique se o checklist possui perguntas cadastradas.
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs" 
                  onClick={refreshData}
                >
                  <RefreshCw className="h-3 w-3 mr-1 text-muted-foreground" />
                  Atualizar dados
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
