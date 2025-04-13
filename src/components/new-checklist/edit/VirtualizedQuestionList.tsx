
import React, { useEffect, useRef } from "react";
import { FixedSizeList as List } from "react-window";
import { QuestionItem } from "@/components/new-checklist/question-editor/QuestionItem";
import { Draggable } from "react-beautiful-dnd";
import { ChecklistQuestion } from "@/types/newChecklist";
import AutoSizer from "react-virtualized-auto-sizer";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/inspection/EmptyState";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VirtualizedQuestionListProps {
  questions: ChecklistQuestion[];
  onAddQuestion: (groupId: string) => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  defaultGroupId?: string;
  enableAllMedia?: boolean;
}

interface ItemData {
  questions: ChecklistQuestion[];
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  enableAllMedia: boolean;
}

const ITEM_HEIGHT = 220; // Adjust based on your question item height

const Row = ({ data, index, style }: { data: ItemData; index: number; style: React.CSSProperties }) => {
  const { questions, onUpdateQuestion, onDeleteQuestion, enableAllMedia } = data;
  const question = questions[index];

  return (
    <div style={style} className="px-1 py-1">
      <Draggable draggableId={question.id} index={index} key={question.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="mb-2"
          >
            <QuestionItem
              question={question}
              dragHandleProps={provided.dragHandleProps}
              onUpdateQuestion={onUpdateQuestion}
              onDeleteQuestion={onDeleteQuestion}
              enableAllMedia={enableAllMedia}
            />
          </div>
        )}
      </Draggable>
    </div>
  );
};

export function VirtualizedQuestionList({ 
  questions, 
  onAddQuestion, 
  onUpdateQuestion, 
  onDeleteQuestion, 
  defaultGroupId = "default",
  enableAllMedia = false
}: VirtualizedQuestionListProps) {
  const listRef = useRef<List>(null);

  // Scroll to bottom when a new question is added
  useEffect(() => {
    if (listRef.current && questions.length > 0) {
      // Only scroll on question add
      if (questions[questions.length - 1].text === "") {
        listRef.current.scrollToItem(questions.length - 1);
      }
    }
  }, [questions.length]);

  if (!questions || questions.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={FileText}
          title="Nenhuma pergunta adicionada"
          description="Adicione perguntas ao seu checklist para começar"
          action={
            <Button onClick={() => onAddQuestion(defaultGroupId)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Pergunta
            </Button>
          }
        />
      </Card>
    );
  }

  const itemData: ItemData = {
    questions,
    onUpdateQuestion,
    onDeleteQuestion,
    enableAllMedia
  };

  return (
    <div className="h-[600px] w-full">
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            width={width}
            itemCount={questions.length}
            itemSize={ITEM_HEIGHT}
            itemData={itemData}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}
