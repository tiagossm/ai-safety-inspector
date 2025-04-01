import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ChevronDown, ChevronUp, GripHorizontal, Plus, Sparkles } from "lucide-react";
import { QuestionItem } from "./QuestionItem";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChecklistQuestion } from "@/types/newChecklist";

export interface QuestionGroupProps {
  group: {
    id: string;
    title: string;
    order: number;
  };
  questions: ChecklistQuestion[];
  onUpdateGroup: (group: { id: string; title: string; order: number }) => void;
  onAddQuestion: (groupId: string) => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  dragHandleProps?: any;
  enableAllMedia?: boolean;
  onGenerateWithAI?: (groupId: string) => void;
}

export function QuestionGroup({
  group,
  questions,
  onUpdateGroup,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onDeleteGroup,
  dragHandleProps,
  enableAllMedia = false,
  onGenerateWithAI
}: QuestionGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between gap-4">
          <div {...dragHandleProps} className="cursor-grab">
            <GripHorizontal className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1">
            <Input
              value={group.title}
              onChange={(e) => onUpdateGroup({ ...group, title: e.target.value })}
              placeholder="Nome do grupo"
              className="font-medium h-8"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDeleteGroup(group.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <CollapsibleTrigger asChild onClick={() => setIsOpen(!isOpen)}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </CardHeader>
      
      <Collapsible open={isOpen}>
        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="space-y-3">
              {questions.map((question) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  onDelete={onDeleteQuestion}
                  onUpdate={onUpdateQuestion}
                  enableAllMedia={enableAllMedia}
                />
              ))}
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => onAddQuestion(group.id)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Pergunta
                </Button>
                
                {onGenerateWithAI && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => onGenerateWithAI(group.id)}
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar com IA
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
