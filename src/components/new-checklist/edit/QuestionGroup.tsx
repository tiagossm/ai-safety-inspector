
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Draggable } from "react-beautiful-dnd";
import { Plus, ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { QuestionItem } from "../question-editor/QuestionItem";

interface QuestionGroupProps {
  group: ChecklistGroup;
  questions: ChecklistQuestion[];
  onUpdateGroup: (group: ChecklistGroup) => void;
  onAddQuestion: (groupId: string) => void;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  dragHandleProps?: any;
  enableAllMedia?: boolean;
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
  enableAllMedia = false
}: QuestionGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-2 bg-slate-50 border-b">
        <div className="flex items-center gap-2 flex-1">
          <div {...dragHandleProps} className="cursor-grab">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <Input
            value={group.title}
            onChange={(e) => onUpdateGroup({ ...group, title: e.target.value })}
            placeholder="Nome do grupo"
            className="h-8 text-base font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Remover grupo"
            onClick={() => onDeleteGroup(group.id)}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </CardHeader>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="p-4 space-y-3">
            {questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Este grupo ainda não possui perguntas
              </div>
            ) : (
              questions.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="flex items-start">
                        <div 
                          className="mt-3 mr-2 cursor-grab" 
                          {...provided.dragHandleProps}
                        >
                          <GripVertical className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <QuestionItem
                            question={question}
                            onUpdate={onUpdateQuestion}
                            onDelete={onDeleteQuestion}
                            enableAllMedia={enableAllMedia}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))
            )}
            
            <div className="pt-2 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddQuestion(group.id)}
                className="w-full max-w-xs"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pergunta ao Grupo
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
