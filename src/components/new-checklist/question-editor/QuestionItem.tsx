
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, Image, Video, Mic } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface QuestionItemProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (questionId: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function QuestionItem({
  question,
  onUpdate,
  onDelete,
  dragHandleProps
}: QuestionItemProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...question,
      text: e.target.value
    });
  };
  
  const handleTypeChange = (value: string) => {
    // Ensure value is one of the allowed response types
    const responseType = value as ChecklistQuestion["responseType"];
    
    // If changing from multiple choice to another type, clear options
    const options = responseType === "multiple_choice" 
      ? question.options || ["Opção 1", "Opção 2"]
      : undefined;
    
    onUpdate({
      ...question,
      responseType,
      options
    });
  };
  
  const handleRequiredChange = (checked: boolean) => {
    onUpdate({
      ...question,
      isRequired: checked
    });
  };
  
  const handleAllowsPhotoChange = (checked: boolean) => {
    onUpdate({
      ...question,
      allowsPhoto: checked
    });
  };
  
  const handleAllowsVideoChange = (checked: boolean) => {
    onUpdate({
      ...question,
      allowsVideo: checked
    });
  };
  
  const handleAllowsAudioChange = (checked: boolean) => {
    onUpdate({
      ...question,
      allowsAudio: checked
    });
  };
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weight = parseInt(e.target.value) || 1;
    onUpdate({
      ...question,
      weight: Math.max(1, Math.min(10, weight)) // Ensure between 1 and 10
    });
  };
  
  const handleOptionChange = (index: number, value: string) => {
    if (!question.options) return;
    
    const newOptions = [...question.options];
    newOptions[index] = value;
    
    onUpdate({
      ...question,
      options: newOptions
    });
  };
  
  const handleAddOption = () => {
    if (!question.options) return;
    
    onUpdate({
      ...question,
      options: [...question.options, `Opção ${question.options.length + 1}`]
    });
  };
  
  const handleRemoveOption = (index: number) => {
    if (!question.options || question.options.length <= 2) return;
    
    const newOptions = [...question.options];
    newOptions.splice(index, 1);
    
    onUpdate({
      ...question,
      options: newOptions
    });
  };
  
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {dragHandleProps && (
            <div {...dragHandleProps} className="cursor-grab">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          
          <Input
            value={question.text}
            onChange={handleTextChange}
            placeholder="Digite a pergunta..."
            className="flex-grow"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(question.id)}
            className="h-10 w-10 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Tipo de resposta:</label>
              <Select
                value={question.responseType}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no">Sim/Não</SelectItem>
                  <SelectItem value="multiple_choice">Múltipla escolha</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="numeric">Numérico</SelectItem>
                  <SelectItem value="photo">Foto</SelectItem>
                  <SelectItem value="signature">Assinatura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Obrigatório:</label>
              <Switch
                checked={question.isRequired}
                onCheckedChange={handleRequiredChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Peso da pergunta:</label>
              <Input
                type="number"
                value={question.weight}
                onChange={handleWeightChange}
                min={1}
                max={10}
                className="w-20 text-right"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1 text-sm font-medium">
                <Image className="h-4 w-4" />
                Permite foto:
              </label>
              <Switch
                checked={question.allowsPhoto}
                onCheckedChange={handleAllowsPhotoChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1 text-sm font-medium">
                <Video className="h-4 w-4" />
                Permite vídeo:
              </label>
              <Switch
                checked={question.allowsVideo}
                onCheckedChange={handleAllowsVideoChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1 text-sm font-medium">
                <Mic className="h-4 w-4" />
                Permite áudio:
              </label>
              <Switch
                checked={question.allowsAudio}
                onCheckedChange={handleAllowsAudioChange}
              />
            </div>
          </div>
        </div>
        
        {question.responseType === "multiple_choice" && question.options && (
          <div className="mt-4 border-t pt-4">
            <label className="text-sm font-medium block mb-2">Opções:</label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Opção ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOption(index)}
                    disabled={question.options!.length <= 2}
                    className="h-10 w-10 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="w-full mt-2"
              >
                Adicionar opção
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
