
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { QuestionGroupsList } from "@/components/new-checklist/question-editor/QuestionGroupsList";

export function ChecklistGroupEditor() {
  const { 
    nonEmptyGroups, 
    questionsByGroup, 
    handleAddGroup, 
    handleUpdateGroup, 
    handleAddQuestion, 
    handleUpdateQuestion, 
    handleDeleteQuestion, 
    handleDeleteGroup, 
    handleDragEnd,
    enableAllMedia,
    isSubmitting
  } = useChecklistEditor();
  
  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="groups" type="GROUP">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {nonEmptyGroups.length > 0 ? (
                <QuestionGroupsList
                  groups={nonEmptyGroups}
                  questionsByGroup={questionsByGroup}
                  onUpdateGroup={handleUpdateGroup}
                  onAddQuestion={handleAddQuestion}
                  onUpdateQuestion={handleUpdateQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onDeleteGroup={handleDeleteGroup}
                  enableAllMedia={enableAllMedia}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <div className="text-center py-8 border border-dashed rounded">
                  <p className="text-muted-foreground mb-4">Nenhum grupo com perguntas encontrado</p>
                  <Button 
                    variant="outline" 
                    onClick={handleAddGroup}
                    className="mx-auto"
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Grupo
                  </Button>
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {nonEmptyGroups.length > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddGroup}
          className="w-full mt-4"
          disabled={isSubmitting}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Grupo
        </Button>
      )}
    </div>
  );
}
