
import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { ChecklistQuestion } from "@/types/newChecklist";
import { EnhancedQuestionEditor } from "./EnhancedQuestionEditor";

interface DragDropQuestionListProps {
  questions: ChecklistQuestion[];
  onQuestionsReorder: (questions: ChecklistQuestion[]) => void;
  onQuestionUpdate: (question: ChecklistQuestion) => void;
  onQuestionDelete: (questionId: string) => void;
}

export function DragDropQuestionList({
  questions,
  onQuestionsReorder,
  onQuestionUpdate,
  onQuestionDelete
}: DragDropQuestionListProps) {
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualizar a ordem das questões
    const reorderedQuestions = items.map((question, index) => ({
      ...question,
      order: index
    }));

    onQuestionsReorder(reorderedQuestions);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="questions">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-4 min-h-[200px] p-4 rounded-lg transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''
            }`}
          >
            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-lg font-medium">Nenhuma pergunta adicionada</div>
                <div className="text-sm">Use o botão "Adicionar Pergunta" para começar</div>
              </div>
            ) : (
              questions.map((question, index) => (
                <Draggable key={question.id} draggableId={question.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-transform ${
                        snapshot.isDragging ? 'scale-105 shadow-lg z-50' : ''
                      }`}
                    >
                      <EnhancedQuestionEditor
                        question={question}
                        questionIndex={index}
                        onUpdate={onQuestionUpdate}
                        onDelete={onQuestionDelete}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
