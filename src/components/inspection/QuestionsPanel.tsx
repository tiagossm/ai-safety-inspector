
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
  
  // Use the first group if none selected
  useEffect(() => {
    if (!currentGroupId && groups.length > 0) {
      console.log("No group selected, but groups exist. This should be fixed at a higher level.");
      console.log("Available groups:", groups);
    }
  }, [currentGroupId, groups]);
  
  // Find current group or use a default group
  const currentGroup = groups.length > 0
    ? (currentGroupId 
        ? groups.find(g => g.id === currentGroupId) 
        : groups[0]) || groups[0]  
    : { id: "default-group", title: "Perguntas", order: 0 };
  
  // Enhanced debugging information
  useEffect(() => {
    console.log(`QuestionsPanel: currentGroupId=${currentGroupId}, filteredQuestions=${filteredQuestions?.length || 0}, questions=${questions?.length || 0}, currentGroup=${currentGroup?.title || "undefined"}`);
    console.log("Available groups:", groups.map(g => `${g.id}: ${g.title}`));
    
    if (questions && questions.length > 0) {
      // Log unique groupIds in questions array
      const uniqueGroupIds = [...new Set(questions.map(q => q.groupId || "undefined"))];
      console.log("Unique groupIds in questions:", uniqueGroupIds);
    }
  }, [currentGroupId, filteredQuestions, questions, groups, currentGroup]);
  
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
  
  // If no group selected, try to use the first one
  const effectiveGroupId = currentGroupId || (groups.length > 0 ? groups[0].id : null);
  
  // If still no group available
  if (!effectiveGroupId) {
    console.warn("No group selected or available");
    return (
      <QuestionsEmptyState 
        loading={loading}
        currentGroupId={null}
        currentGroup={undefined}
        questionsCount={questions?.length || 0}
      />
    );
  }
  
  // If no filtered questions but we have questions
  if (filteredQuestions?.length === 0 && questions?.length > 0) {
    console.warn(`No questions found for group "${currentGroup?.title || effectiveGroupId}"`);
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
