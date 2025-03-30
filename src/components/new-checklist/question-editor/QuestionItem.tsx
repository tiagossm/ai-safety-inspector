
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, GripVertical, Trash2, Pencil, Plus, FilePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [expanded, setExpanded] = useState(false);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...question,
      text: e.target.value
    });
  };
  
  const handleTypeChange = (value: string) => {
    let updatedQuestion: ChecklistQuestion = {
      ...question,
      type: value,
      responseType: value
    };
    
    // Reset options if changing from multiple choice to another type
    if (value !== "múltipla escolha" && question.type === "múltipla escolha") {
      updatedQuestion.options = [];
    }
    
    // Initialize options if changing to multiple choice
    if (value === "múltipla escolha" && (!question.options || question.options.length === 0)) {
      updatedQuestion.options = ["Opção 1", "Opção 2"];
    }
    
    onUpdate(updatedQuestion);
  };
  
  const handleRequiredChange = (checked: boolean) => {
    onUpdate({
      ...question,
      isRequired: checked
    });
  };
  
  const handlePhotoChange = (checked: boolean) => {
    onUpdate({
      ...question,
      allowsPhoto: checked
    });
  };
  
  const handleVideoChange = (checked: boolean) => {
    onUpdate({
      ...question,
      allowsVideo: checked
    });
  };
  
  const handleAudioChange = (checked: boolean) => {
    onUpdate({
      ...question,
      allowsAudio: checked
    });
  };
  
  const handleHintChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...question,
      hint: e.target.value
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
    const newOptions = question.options ? [...question.options] : [];
    newOptions.push(`Opção ${newOptions.length + 1}`);
    
    onUpdate({
      ...question,
      options: newOptions
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
  
  const handleToggleSubChecklist = () => {
    if (question.subChecklistId) {
      onUpdate({
        ...question,
        subChecklistId: null
      });
    } else {
      onUpdate({
        ...question,
        subChecklistId: "new"
      });
    }
  };
  
  return (
    <div className="border rounded-md p-3 bg-white">
      <div className="flex items-start gap-2">
        <div className="mt-2.5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Input
              value={question.text}
              onChange={handleTextChange}
              placeholder="Digite a pergunta"
              className="flex-1"
            />
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete(question.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Tipo:</Label>
              <Select
                value={question.type || question.responseType}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="h-7 w-[150px] text-xs">
                  <SelectValue placeholder="Tipo de resposta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim/não">Sim/Não</SelectItem>
                  <SelectItem value="múltipla escolha">Múltipla escolha</SelectItem>
                  <SelectItem value="texto">Texto</SelectItem>
                  <SelectItem value="número">Número</SelectItem>
                  <SelectItem value="foto">Foto</SelectItem>
                  <SelectItem value="assinatura">Assinatura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Switch 
                id={`required-${question.id}`} 
                checked={question.isRequired !== false}
                onCheckedChange={handleRequiredChange}
                size="sm"
              />
              <Label htmlFor={`required-${question.id}`} className="text-xs">Obrigatório</Label>
            </div>
            
            {question.subChecklistId && (
              <Badge variant="outline" className="bg-blue-50">
                Sub-checklist
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t space-y-4 pl-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Permite anexos</Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Switch 
                      id={`photo-${question.id}`} 
                      checked={question.allowsPhoto}
                      onCheckedChange={handlePhotoChange}
                      size="sm"
                    />
                    <Label htmlFor={`photo-${question.id}`} className="text-xs">Foto</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Switch 
                      id={`video-${question.id}`} 
                      checked={question.allowsVideo}
                      onCheckedChange={handleVideoChange}
                      size="sm"
                    />
                    <Label htmlFor={`video-${question.id}`} className="text-xs">Vídeo</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Switch 
                      id={`audio-${question.id}`} 
                      checked={question.allowsAudio}
                      onCheckedChange={handleAudioChange}
                      size="sm"
                    />
                    <Label htmlFor={`audio-${question.id}`} className="text-xs">Áudio</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor={`hint-${question.id}`} className="text-xs">Dica ou informação adicional</Label>
                <Textarea
                  id={`hint-${question.id}`}
                  value={question.hint || ""}
                  onChange={handleHintChange}
                  placeholder="Dica para auxiliar o inspetor"
                  className="min-h-[80px] text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Sub-checklist</Label>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    onClick={handleToggleSubChecklist}
                    className="h-7 text-xs gap-1"
                  >
                    {question.subChecklistId ? (
                      <>
                        <Trash2 className="h-3 w-3" />
                        <span>Remover</span>
                      </>
                    ) : (
                      <>
                        <FilePlus className="h-3 w-3" />
                        <span>Adicionar</span>
                      </>
                    )}
                  </Button>
                </div>
                {question.subChecklistId && (
                  <p className="text-xs text-muted-foreground">
                    Este item possui um sub-checklist associado. Use o botão "Editar Sub-checklist" na barra de ações para configurá-lo.
                  </p>
                )}
              </div>
            </div>
            
            {question.type === "múltipla escolha" && (
              <div className="space-y-2">
                <Label className="text-xs">Opções de resposta</Label>
                <div className="space-y-2">
                  {question.options && question.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                        className="text-sm"
                      />
                      {question.options && question.options.length > 2 && (
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="w-full text-xs mt-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar opção
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
