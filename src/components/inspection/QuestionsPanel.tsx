
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
  
  // Encontrar o grupo atual ou usar um grupo padrão
  const currentGroup = currentGroupId 
    ? groups.find(g => g.id === currentGroupId) 
    : { id: "default-group", title: "Perguntas", order: 0 };
  
  // Log para debug
  console.log(`QuestionsPanel: currentGroupId=${currentGroupId}, filteredQuestions=${filteredQuestions?.length || 0}, questions=${questions?.length || 0}, currentGroup=${currentGroup?.title || "undefined"}`);
  
  useEffect(() => {
    if (questions?.length > 0 && filteredQuestions?.length === 0 && currentGroupId) {
      console.warn(`No questions are being shown despite having ${questions.length} questions available. Check groupId filtering.`);
    }
  }, [questions, filteredQuestions, currentGroupId]);
  
  // Se não temos perguntas para mostrar, exibir o estado vazio
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
  
  // Se não tem grupo selecionado ou não encontrou o grupo atual
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
  
  // Se não tem perguntas filtradas mas tem perguntas
  if (filteredQuestions?.length === 0 && questions?.length > 0) {
    toast.warning(`Nenhuma pergunta encontrada para o grupo "${currentGroup?.title || 'selecionado'}"`);
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
