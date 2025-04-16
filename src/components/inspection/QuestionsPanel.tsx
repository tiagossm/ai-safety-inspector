
import React, { useEffect } from "react";
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
  
  // Find current group or use a default group
  const currentGroup = currentGroupId 
    ? groups.find(g => g.id === currentGroupId) 
    : { id: "default-group", title: "Perguntas", order: 0 };
  
  // Improved logging
  console.log(`QuestionsPanel: currentGroupId=${currentGroupId}, filteredQuestions=${filteredQuestions?.length || 0}, questions=${questions?.length || 0}, currentGroup=${currentGroup?.title || "undefined"}`);
  
  // Add debug logging to track questions data
  useEffect(() => {
    if (questions && questions.length > 0) {
      console.log("Questions data available:", questions.length);
      // Log the unique groupIds in the questions array
      const groupIds = [...new Set(questions.map(q => q.groupId || "undefined"))];
      console.log("Unique groupIds in questions:", groupIds);
    } else {
      console.warn("No questions data available");
    }
  }, [questions]);
  
  useEffect(() => {
    // Show warning if we have questions but filtered questions is empty
    if (questions?.length > 0 && filteredQuestions?.length === 0 && currentGroupId) {
      console.warn(`No questions are being shown despite having ${questions.length} questions available. Check groupId filtering.`);
      
      // If no filtered questions but we have questions, this suggests a filtering issue
      if (groups.length > 0) {
        toast.warning(`Tentando mostrar perguntas do grupo "${currentGroup?.title || currentGroupId}", mas nenhuma foi encontrada.`, {
          id: "filtering-issue",
          duration: 5000
        });
      }
    }
  }, [questions, filteredQuestions, currentGroupId, groups, currentGroup]);
  
  // If loading show loading state
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
  
  // If no group selected or not found
  if (!currentGroupId || !currentGroup) {
    toast.error("Nenhum grupo de perguntas selecionado");
    return (
      <QuestionsEmptyState 
        loading={loading}
        currentGroupId={currentGroupId}
        currentGroup={undefined}
        questionsCount={questions?.length || 0}
      />
    );
  }
  
  // If no filtered questions but we have questions
  if (filteredQuestions?.length === 0 && questions?.length > 0) {
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
          {filteredQuestions?.length > 0 ? (
            <QuestionsList
              questions={filteredQuestions}
              responses={responses}
              allQuestions={questions}
              onResponseChange={onResponseChange}
              onOpenSubChecklist={(questionId) => handleOpenSubChecklist(questionId, subChecklists)}
              subChecklists={subChecklists}
            />
          ) : (
            <QuestionsEmptyState 
              loading={loading}
              currentGroupId={currentGroupId}
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
            responses[currentParentQuestionId] && 
            responses[currentParentQuestionId].subChecklistResponses
              ? safeParseResponse(responses[currentParentQuestionId].subChecklistResponses)
              : {}
          }
          onSaveResponses={async (responses) => {
            await handleSaveSubChecklistResponses(responses);
          }}
          saving={savingSubChecklist}
        />
      )}
    </>
  );
}
