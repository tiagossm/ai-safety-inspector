
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ChecklistQuestion } from "@/types/newChecklist";
import { QuestionEditor } from "@/components/new-checklist/question-editor/QuestionEditor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SimpleQuestionListProps {
  questions: ChecklistQuestion[];
  onAddQuestion: () => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDragEnd: (result: any) => void;
  enableAllMedia?: boolean;
  isSubmitting?: boolean;
}

export function SimpleQuestionList({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDragEnd,
  enableAllMedia = false,
  isSubmitting = false
}: SimpleQuestionListProps) {
  // Handle adding sub-questions
  const handleAddSubQuestion = (parentId: string) => {
    const parentQuestion = questions.find(q => q.id === parentId);
    if (parentQuestion) {
      const newId = `new-${Date.now()}`;
      const siblingSubQuestions = questions.filter(q => q.parentQuestionId === parentId);
      const order = questions.length + siblingSubQuestions.length;

      const newSubQuestion: ChecklistQuestion = {
        id: newId,
        text: "",
        responseType: "yes_no",
        isRequired: true,
        order,
        weight: 1,
        allowsPhoto: enableAllMedia,
        allowsVideo: enableAllMedia,
        allowsAudio: enableAllMedia,
        allowsFiles: enableAllMedia,
        groupId: parentQuestion.groupId || "default",
        parentQuestionId: parentId,
        level: (parentQuestion.level || 0) + 1,
        path: `${parentQuestion.path}/${newId}`,
        isConditional: false,
        options: []
      };
      
      onUpdateQuestion(newSubQuestion);
    }
  };

  // Separate main questions from sub-questions
  const mainQuestions = questions
    .filter(q => !q.parentQuestionId)
    .sort((a, b) => a.order - b.order);

  const renderQuestion = (question: ChecklistQuestion, index: number, isSubQuestion = false) => {
    const subQuestions = questions
      .filter(q => q.parentQuestionId === question.id)
      .sort((a, b) => a.order - b.order);

    return (
      <div key={question.id} className="space-y-2">
        <Draggable draggableId={question.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
            >
              <QuestionEditor
                question={question}
                questions={questions}
                groupIndex={0}
                onUpdate={onUpdateQuestion}
                onDelete={onDeleteQuestion}
                onAddSubQuestion={handleAddSubQuestion}
                isSubQuestion={isSubQuestion}
                enableAllMedia={enableAllMedia}
                dragHandleProps={provided.dragHandleProps}
              />
            </div>
          )}
        </Draggable>
        
        {/* Render sub-questions */}
        {subQuestions.length > 0 && (
          <div className="ml-6 space-y-2">
            {subQuestions.map((subQuestion, subIndex) => 
              renderQuestion(subQuestion, subIndex, true)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Perguntas do Checklist</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddQuestion}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Pergunta
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-lg">Nenhuma pergunta adicionada ainda</p>
          <p className="text-sm mt-1">Clique em "Adicionar Pergunta" para começar</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddQuestion}
            disabled={isSubmitting}
            className="mt-4 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Primeira Pergunta
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="questions" type="QUESTION">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4"
              >
                {mainQuestions.map((question, index) => 
                  renderQuestion(question, index)
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
