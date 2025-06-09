
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { ImprovedQuestionEditor } from "../editor/ImprovedQuestionEditor";

interface SimpleQuestionListProps {
  questions: ChecklistQuestion[];
  onAddQuestion: () => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onDragEnd: (result: DropResult) => void;
  enableAllMedia: boolean;
  isSubmitting: boolean;
}

export function SimpleQuestionList({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDragEnd,
  enableAllMedia,
  isSubmitting
}: SimpleQuestionListProps) {
  const mainQuestions = questions.filter(q => !q.parentQuestionId);
  
  return (
    <div className="space-y-4">
      {/* Botão para adicionar pergunta */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {mainQuestions.length} pergunta{mainQuestions.length !== 1 ? 's' : ''} principal{mainQuestions.length !== 1 ? 'is' : ''}
        </p>
        <Button
          type="button"
          onClick={onAddQuestion}
          disabled={isSubmitting}
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Nova pergunta
        </Button>
      </div>

      {/* Lista de perguntas com drag and drop */}
      {mainQuestions.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="questions-list">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-4 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-blue-50 p-4 rounded-md' : ''
                }`}
              >
                {mainQuestions.map((question, index) => (
                  <Draggable key={question.id} draggableId={question.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ImprovedQuestionEditor
                          question={question}
                          questionIndex={index}
                          onUpdate={onUpdateQuestion}
                          onDelete={onDeleteQuestion}
                          isDragging={snapshot.isDragging}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Nenhuma pergunta adicionada ainda</p>
        </div>
      )}
    </div>
  );
}
