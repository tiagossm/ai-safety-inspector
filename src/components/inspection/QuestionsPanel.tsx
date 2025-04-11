
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SubChecklistDialog } from "./dialogs/SubChecklistDialog";
import { useSubChecklistDialog } from "@/hooks/inspection/useSubChecklistDialog";
import { QuestionsEmptyState } from "./questions-panel/QuestionsEmptyState";
import { QuestionsList } from "./questions-panel/QuestionsList";

export interface QuestionsPanelProps {
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
  
  // Encontrar o grupo atual ou usar um grupo padrão
  const currentGroup = currentGroupId 
    ? groups.find(g => g.id === currentGroupId) 
    : { id: "default-group", title: "Perguntas", order: 0 };
  
  // Se não temos perguntas para mostrar, exibir o estado vazio
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
          <h3 className="text-lg font-semibold">{currentGroup.title || "Perguntas"}</h3>
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
          onSaveResponses={async (responses) => {
            await handleSaveSubChecklistResponses(responses);
          }}
          saving={savingSubChecklist}
        />
      )}
    </>
  );
}
