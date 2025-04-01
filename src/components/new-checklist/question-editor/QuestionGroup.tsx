
import React from "react";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionItem } from "./QuestionItem";
import { Plus, GripVertical, Trash2 } from "lucide-react";

interface QuestionGroupProps {
  group: ChecklistGroup;
  questions: ChecklistQuestion[];
  onGroupUpdate: (group: ChecklistGroup) => void;
  onAddQuestion: (groupId: string) => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  enableAllMedia?: boolean;
}

export function QuestionGroup({
  group,
  questions,
  onGroupUpdate,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDeleteGroup,
  dragHandleProps,
  enableAllMedia = false
}: QuestionGroupProps) {
  // Questions filtered to only include those in this group
  const groupQuestions = questions.filter(q => q.groupId === group.id)
    .sort((a, b) => a.order - b.order);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onGroupUpdate({
      ...group,
      title: e.target.value
    });
  };
  
  const handleAddQuestion = () => {
    onAddQuestion(group.id);
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2 flex-grow">
          <div {...dragHandleProps} className="cursor-grab">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            value={group.title}
            onChange={handleTitleChange}
            placeholder="Nome do grupo"
            className="font-medium border-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0 pl-1"
          />
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDeleteGroup(group.id)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {groupQuestions.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-md">
            <p className="text-sm text-muted-foreground mb-2">
              Nenhuma pergunta neste grupo
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddQuestion}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar pergunta
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {groupQuestions.map((question) => (
              <QuestionItem
                key={question.id}
                question={question}
                onUpdate={onUpdateQuestion}
                onDelete={onDeleteQuestion}
                enableAllMedia={enableAllMedia}
              />
            ))}
            
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddQuestion}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar pergunta
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
