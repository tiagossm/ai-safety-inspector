
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SubChecklistDialog } from "./dialogs/SubChecklistDialog";
import { useSubChecklistDialog } from "@/hooks/inspection/useSubChecklistDialog";
import { QuestionsEmptyState } from "./questions-panel/QuestionsEmptyState";
import { QuestionsList } from "./questions-panel/QuestionsList";

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
  
  const currentGroup = groups.find(g => g.id === currentGroupId);
  
  // Display loading or empty states if needed
  if (loading || !currentGroupId || !currentGroup || filteredQuestions.length === 0) {
    return (
      <QuestionsEmptyState 
        loading={loading}
        currentGroupId={currentGroupId}
        currentGroup={currentGroup}
        questionsCount={questions.length}
      />
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{currentGroup.title}</h3>
          <p className="text-sm text-muted-foreground">
            {filteredQuestions.length} {filteredQuestions.length === 1 ? 'pergunta' : 'perguntas'} neste grupo
          </p>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <QuestionsList
            questions={filteredQuestions}
            responses={responses}
            allQuestions={questions}
            onResponseChange={onResponseChange}
            onOpenSubChecklist={(questionId) => handleOpenSubChecklist(questionId, subChecklists)}
            subChecklists={subChecklists}
          />
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
          onSaveResponses={handleSaveSubChecklistResponses}
          saving={savingSubChecklist}
        />
      )}
    </>
  );
}
