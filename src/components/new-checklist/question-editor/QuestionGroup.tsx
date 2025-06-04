
import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { ChecklistGroup, ChecklistQuestion } from "@/types/newChecklist";
import { QuestionEditor } from "./QuestionEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface QuestionGroupProps {
  group: ChecklistGroup;
  questions: ChecklistQuestion[];
  groupIndex: number;
  onUpdateGroup: (group: ChecklistGroup) => void;
  onAddQuestion: (groupId: string) => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddSubQuestion: (parentId: string) => void;
  dragHandleProps?: any;
  enableAllMedia?: boolean;
}

export function QuestionGroup({
  group,
  questions,
  groupIndex,
  onUpdateGroup,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDeleteGroup,
  onAddSubQuestion,
  dragHandleProps,
  enableAllMedia = false
}: QuestionGroupProps) {
  const handleGroupTitleChange = (title: string) => {
    onUpdateGroup({ ...group, title });
  };

  const mainQuestions = questions.filter(q => !q.parentQuestionId);
  const subQuestions = questions.filter(q => q.parentQuestionId);

  const renderQuestion = (question: ChecklistQuestion, isSubQuestion = false) => {
    const questionSubQuestions = subQuestions.filter(sq => sq.parentQuestionId === question.id);
    
    return (
      <div key={question.id} className="space-y-2">
        <Draggable draggableId={question.id} index={question.order}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
            >
              <QuestionEditor
                question={question}
                questions={questions}
                groupIndex={groupIndex}
                onUpdate={onUpdateQuestion}
                onDelete={onDeleteQuestion}
                onAddSubQuestion={onAddSubQuestion}
                isSubQuestion={isSubQuestion}
                enableAllMedia={enableAllMedia}
                dragHandleProps={provided.dragHandleProps}
              />
            </div>
          )}
        </Draggable>
        
        {/* Render sub-questions */}
        {questionSubQuestions.length > 0 && (
          <div className="ml-6 space-y-2">
            {questionSubQuestions
              .sort((a, b) => a.order - b.order)
              .map(subQuestion => renderQuestion(subQuestion, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-lg bg-white">
      {/* Group Header */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 border-b">
        {dragHandleProps && (
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}
        
        <Input
          value={group.title}
          onChange={(e) => handleGroupTitleChange(e.target.value)}
          placeholder="Nome do grupo"
          className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0"
        />
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddQuestion(group.id)}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            <span>Pergunta</span>
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteGroup(group.id)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Questions */}
      <div className="p-4 space-y-4">
        {mainQuestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma pergunta neste grupo</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddQuestion(group.id)}
              className="mt-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Adicionar primeira pergunta
            </Button>
          </div>
        ) : (
          mainQuestions
            .sort((a, b) => a.order - b.order)
            .map(question => renderQuestion(question))
        )}
      </div>
    </div>
  );
}
