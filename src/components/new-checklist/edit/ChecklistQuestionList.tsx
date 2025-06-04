
import React from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { QuestionGroupsList } from "./QuestionGroupsList";
import { MediaToggle } from "./MediaToggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ChecklistQuestionList() {
  const {
    questions,
    groups,
    viewMode,
    questionsByGroup,
    nonEmptyGroups,
    enableAllMedia,
    handleAddGroup,
    handleUpdateGroup,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleDeleteGroup,
    handleDragEnd,
    toggleAllMediaOptions
  } = useChecklistEditor();

  // Handle adding sub-questions
  const handleAddSubQuestion = (parentId: string) => {
    // Find the parent question to get its group
    const parentQuestion = questions.find(q => q.id === parentId);
    if (parentQuestion) {
      const newId = `new-${Date.now()}`;
      const siblingSubQuestions = questions.filter(q => q.parentQuestionId === parentId);
      const order = questions.length + siblingSubQuestions.length;

      const newSubQuestion = {
        id: newId,
        text: "",
        responseType: "yes_no" as const,
        isRequired: true,
        order,
        weight: 1,
        allowsPhoto: enableAllMedia,
        allowsVideo: enableAllMedia,
        allowsAudio: enableAllMedia,
        allowsFiles: enableAllMedia,
        groupId: parentQuestion.groupId,
        parentQuestionId: parentId,
        level: (parentQuestion.level || 0) + 1,
        path: `${parentQuestion.path}/${newId}`,
        isConditional: false,
        options: []
      };
      
      handleUpdateQuestion(newSubQuestion);
    }
  };

  return (
    <div className="space-y-6">
      {/* Media Toggle */}
      <MediaToggle 
        enableAllMedia={enableAllMedia}
        onToggle={toggleAllMediaOptions}
      />

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Perguntas do Checklist</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddGroup}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Novo Grupo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="groups" type="GROUP">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4"
                >
                  <QuestionGroupsList
                    groups={nonEmptyGroups}
                    questions={questions}
                    questionsByGroup={questionsByGroup}
                    onUpdateGroup={handleUpdateGroup}
                    onAddQuestion={handleAddQuestion}
                    onUpdateQuestion={handleUpdateQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                    onDeleteGroup={handleDeleteGroup}
                    onAddSubQuestion={handleAddSubQuestion}
                    enableAllMedia={enableAllMedia}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Empty State */}
          {questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma pergunta adicionada ainda.</p>
              <p className="text-sm">Adicione um grupo para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
