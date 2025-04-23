
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SubChecklistDialog } from "./dialogs/SubChecklistDialog";
import { useSubChecklistDialog } from "@/hooks/inspection/useSubChecklistDialog";
import { QuestionsEmptyState } from "./questions-panel/QuestionsEmptyState";
import { QuestionsList } from "./questions-panel/QuestionsList";
import { toast } from "sonner";

interface QuestionsPanelProps {
  loading: boolean;
  currentGroupId: string | null;
  filteredQuestions: any[];
  questions: any[];
  responses: Record<string, any>;
  groups: any[];
  onResponseChange: (questionId: string, data: any) => void;
  onSaveSubChecklistResponses: (questionId: string, responses: Record<string, any>) => Promise<void>;
  subChecklists: Record<string, any>;
}

export function QuestionsPanel({
  loading,
  currentGroupId,
  filteredQuestions,
  questions,
  responses,
  groups,
  onResponseChange,
  onSaveSubChecklistResponses,
  subChecklists
}: QuestionsPanelProps) {
  const {
    subChecklistDialogOpen,
    setSubChecklistDialogOpen,
    currentSubChecklist,
    currentParentQuestionId,
    savingSubChecklist,
    handleOpenSubChecklist,
    handleSaveSubChecklistResponses,
    safeParseResponse
  } = useSubChecklistDialog(responses, onResponseChange, onSaveSubChecklistResponses);
  
  // Encontrar grupo atual ou usar grupo padrão
  const currentGroup = React.useMemo(() => {
    if (!groups || groups.length === 0) {
      return { id: "default-group", title: "Perguntas", order: 0 };
    }
    
    if (!currentGroupId) {
      return groups[0];
    }
    
    return groups.find(g => g.id === currentGroupId) || groups[0];
  }, [groups, currentGroupId]);
  
  // Se carregando mostrar estado de carregamento
  if (loading) {
    return (
      <QuestionsEmptyState 
        loading={true}
        currentGroupId={currentGroupId}
        currentGroup={currentGroup}
        questionsCount={questions?.length || 0}
      />
    );
  }
  
  // Se não há grupo selecionado, tentar usar o primeiro
  const effectiveGroupId = currentGroupId || (groups && groups.length > 0 ? groups[0].id : null);
  
  // Se não há perguntas filtradas mas temos perguntas
  if (!filteredQuestions?.length && questions?.length > 0) {
    toast.warning(`Nenhuma pergunta encontrada para o grupo "${currentGroup?.title || 'selecionado'}"`, {
      id: "no-questions-in-group",
      duration: 3000
    });
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{currentGroup?.title || "Perguntas"}</h3>
          <p className="text-sm text-muted-foreground">
            {filteredQuestions?.length || 0} {(filteredQuestions?.length || 0) === 1 ? 'pergunta' : 'perguntas'} neste grupo
          </p>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {filteredQuestions && filteredQuestions.length > 0 ? (
            <QuestionsList
              questions={filteredQuestions}
              responses={responses || {}}
              allQuestions={questions || []}
              onResponseChange={onResponseChange}
              onOpenSubChecklist={(questionId) => handleOpenSubChecklist(questionId, subChecklists || {})}
              subChecklists={subChecklists || {}}
            />
          ) : (
            <QuestionsEmptyState 
              loading={loading}
              currentGroupId={effectiveGroupId}
              currentGroup={currentGroup}
              questionsCount={questions?.length || 0}
            />
          )}
        </CardContent>
      </Card>
      
      {currentSubChecklist && (
        <SubChecklistDialog
          open={subChecklistDialogOpen}
          onOpenChange={setSubChecklistDialogOpen}
          subChecklist={currentSubChecklist}
          subChecklistQuestions={currentSubChecklist.questions || []}
          currentResponses={
            currentParentQuestionId && 
            responses && responses[currentParentQuestionId] && 
            responses[currentParentQuestionId].subChecklistResponses
              ? safeParseResponse(responses[currentParentQuestionId].subChecklistResponses)
              : {}
          }
          onSaveResponses={handleSaveSubChecklistResponses}
          saving={savingSubChecklist}
        />
      )}
    </>
  );
}
