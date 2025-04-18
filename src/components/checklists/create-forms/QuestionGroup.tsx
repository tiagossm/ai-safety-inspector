
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ChevronDown, ChevronUp, GripHorizontal, Plus, Sparkles } from "lucide-react";
import { QuestionItem } from "./QuestionItem";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface QuestionGroupProps {
  id: string;
  title: string;
  questions: any[];
  onTitleChange: (id: string, title: string) => void;
  onAddQuestion: (groupId: string) => void;
  onRemoveQuestion: (groupId: string, questionIndex: number) => void;
  onQuestionChange: (groupId: string, questionIndex: number, field: string, value: any) => void;
  onRemoveGroup: (id: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
  onGenerateWithAI?: (groupId: string) => void;
}

export function QuestionGroup({
  id,
  title,
  questions,
  onTitleChange,
  onAddQuestion,
  onRemoveQuestion,
  onQuestionChange,
  onRemoveGroup,
  isDragging,
  dragHandleProps,
  onGenerateWithAI
}: QuestionGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className={`mb-4 ${isDragging ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between gap-4">
          <div {...dragHandleProps} className="cursor-grab">
            <GripHorizontal className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => onTitleChange(id, e.target.value)}
              placeholder="Nome do grupo"
              className="font-medium h-8"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onRemoveGroup(id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="space-y-3">
              {questions.map((question, index) => (
                <QuestionItem
                  key={index}
                  index={index}
                  question={question}
                  onRemove={(idx) => onRemoveQuestion(id, idx)}
                  onChange={(idx, field, value) => onQuestionChange(id, idx, field, value)}
                />
              ))}
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => onAddQuestion(id)}
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
                    onClick={() => onGenerateWithAI(id)}
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
