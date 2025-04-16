
import React from "react";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { ChecklistQuestions } from "./ChecklistQuestions";
import { Card, CardContent } from "@/components/ui/card";
import { FlatQuestionsList } from "./FlatQuestionsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ChecklistQuestionList() {
  const {
    questions,
    groups,
    viewMode,
    questionsByGroup,
    nonEmptyGroups,
    isSubmitting,
    enableAllMedia,
    setViewMode,
    handleAddGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleDragEnd,
  } = useChecklistEditor();

  // Handler to add a question to the default group
  const handleAddDefaultQuestion = () => {
    handleAddQuestion("default");
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        {viewMode === "flat" ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Perguntas{questions.length > 0 ? ` (${questions.length})` : ""}
              </h2>
              <Button
                variant="outline"
                onClick={handleAddDefaultQuestion}
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Pergunta
              </Button>
            </div>

            <FlatQuestionsList
              questions={questions}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              enableAllMedia={enableAllMedia}
              isSubmitting={isSubmitting}
            />
          </div>
        ) : (
          <ChecklistQuestions
            questions={questions}
            groups={groups}
            nonEmptyGroups={nonEmptyGroups}
            questionsByGroup={questionsByGroup}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddGroup={handleAddGroup}
            onUpdateGroup={handleUpdateGroup}
            onDeleteGroup={handleDeleteGroup}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onDragEnd={handleDragEnd}
            enableAllMedia={enableAllMedia}
            isSubmitting={isSubmitting}
          />
        )}
      </CardContent>
    </Card>
  );
}
