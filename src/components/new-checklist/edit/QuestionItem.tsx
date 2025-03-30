
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  GripVertical,
  FileEdit,
  List,
  CheckSquare,
  Image,
  Type,
  Hash
} from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuestionItemProps {
  question: ChecklistQuestion;
  index: number;
  onUpdateQuestion: (question: ChecklistQuestion) => void;
  onDeleteQuestion: (questionId: string) => void;
  onEditSubChecklist?: (questionId: string, subChecklistId: string) => void;
}

export function QuestionItem({
  question,
  index,
  onUpdateQuestion,
  onDeleteQuestion,
  onEditSubChecklist
}: QuestionItemProps) {
  const handleChange = (key: keyof ChecklistQuestion, value: any) => {
    onUpdateQuestion({ ...question, [key]: value });
  };
  
  // Get the appropriate icon for the response type
  const getResponseTypeIcon = (type: string) => {
    switch (type) {
      case 'yes_no': return <CheckSquare className="h-4 w-4" />;
      case 'multiple_choice': return <List className="h-4 w-4" />;
      case 'text': return <Type className="h-4 w-4" />;
      case 'numeric': return <Hash className="h-4 w-4" />;
      case 'photo': return <Image className="h-4 w-4" />;
      default: return <CheckSquare className="h-4 w-4" />;
    }
  };
  
  return (
    <Draggable draggableId={question.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="transition-all"
        >
          <Card className="border">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <div
                  {...provided.dragHandleProps}
                  className="cursor-grab hover:bg-accent rounded p-1 self-start mt-1"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <Input
                    value={question.text}
                    onChange={(e) => handleChange('text', e.target.value)}
                    placeholder="Texto da pergunta"
                    className="w-full"
                  />
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor={`q-${question.id}-type`} className="text-xs mb-1 block">
                        Tipo de Resposta
                      </Label>
                      <Select
                        value={question.responseType}
                        onValueChange={(value) => handleChange('responseType', value)}
                      >
                        <SelectTrigger id={`q-${question.id}-type`} className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes_no">Sim/Não</SelectItem>
                          <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="numeric">Numérico</SelectItem>
                          <SelectItem value="photo">Foto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`q-${question.id}-weight`} className="text-xs mb-1 block">
                        Peso
                      </Label>
                      <Select
                        value={question.weight.toString()}
                        onValueChange={(value) => handleChange('weight', parseInt(value))}
                      >
                        <SelectTrigger id={`q-${question.id}-weight`} className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 (Normal)</SelectItem>
                          <SelectItem value="2">2 (Importante)</SelectItem>
                          <SelectItem value="3">3 (Crítico)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`q-${question.id}-required`}
                        checked={question.isRequired}
                        onCheckedChange={(checked) => handleChange('isRequired', checked)}
                      />
                      <Label htmlFor={`q-${question.id}-required`} className="text-xs">
                        Obrigatório
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`q-${question.id}-photo`}
                        checked={question.allowsPhoto}
                        onCheckedChange={(checked) => handleChange('allowsPhoto', checked)}
                      />
                      <Label htmlFor={`q-${question.id}-photo`} className="text-xs">
                        Permitir Foto
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`q-${question.id}-video`}
                        checked={question.allowsVideo}
                        onCheckedChange={(checked) => handleChange('allowsVideo', checked)}
                      />
                      <Label htmlFor={`q-${question.id}-video`} className="text-xs">
                        Permitir Vídeo
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`q-${question.id}-audio`}
                        checked={question.allowsAudio}
                        onCheckedChange={(checked) => handleChange('allowsAudio', checked)}
                      />
                      <Label htmlFor={`q-${question.id}-audio`} className="text-xs">
                        Permitir Áudio
                      </Label>
                    </div>
                  </div>
                  
                  {/* Sub-checklist edit button - only show if it has a sub-checklist ID */}
                  {question.subChecklistId && onEditSubChecklist && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditSubChecklist(question.id, question.subChecklistId!)}
                        className="h-8 text-xs"
                      >
                        <FileEdit className="h-3.5 w-3.5 mr-1" />
                        Editar Sub-Checklist
                      </Button>
                    </div>
                  )}
                </div>
                
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteQuestion(question.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Excluir pergunta</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
