
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Camera, Video, Mic } from "lucide-react";

interface QuestionEditorProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function QuestionEditor({ question, onUpdate }: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...question,
      text: e.target.value
    });
  };
  
  const handleResponseTypeChange = (value: string) => {
    onUpdate({
      ...question,
      responseType: value as any
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
  
  const handleHintChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...question,
      hint: e.target.value
    });
  };
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    onUpdate({
      ...question,
      weight: value
    });
  };
  
  return (
    <div className="space-y-4">
      <Input
        placeholder="Digite a pergunta..."
        value={question.text}
        onChange={handleTextChange}
        className="w-full"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Resposta</Label>
          <Select
            value={question.responseType}
            onValueChange={handleResponseTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes_no">Sim/Não</SelectItem>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="numeric">Numérico</SelectItem>
              <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
              <SelectItem value="photo">Foto</SelectItem>
              <SelectItem value="signature">Assinatura</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Peso da Pergunta</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={question.weight}
            onChange={handleWeightChange}
          />
        </div>
      </div>
      
      {/* Opções de múltipla escolha (apenas exibe quando relevante) */}
      {question.responseType === 'multiple_choice' && (
        <div>
          <Label>Opções</Label>
          <div className="border rounded p-2 space-y-2">
            {(question.options || []).map((option, index) => (
              <Input 
                key={index}
                value={option}
                onChange={(e) => {
                  const newOptions = [...(question.options || [])];
                  newOptions[index] = e.target.value;
                  onUpdate({
                    ...question,
                    options: newOptions
                  });
                }}
                className="mb-2"
              />
            ))}
            <button
              type="button"
              onClick={() => {
                onUpdate({
                  ...question,
                  options: [...(question.options || []), ""]
                });
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Adicionar opção
            </button>
          </div>
        </div>
      )}
      
      <Textarea
        placeholder="Instruções ou dicas para o inspetor (opcional)..."
        value={question.hint || ""}
        onChange={handleHintChange}
        rows={2}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`required-${question.id}`} className="flex items-center">
              Obrigatório
            </Label>
            <Switch
              id={`required-${question.id}`}
              checked={question.isRequired}
              onCheckedChange={handleRequiredChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor={`allows-photo-${question.id}`} className="flex items-center gap-1">
              <Camera className="h-4 w-4" />
              Permite Foto
            </Label>
            <Switch
              id={`allows-photo-${question.id}`}
              checked={question.allowsPhoto}
              onCheckedChange={handleAllowsPhotoChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`allows-video-${question.id}`} className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              Permite Vídeo
            </Label>
            <Switch
              id={`allows-video-${question.id}`}
              checked={question.allowsVideo}
              onCheckedChange={handleAllowsVideoChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor={`allows-audio-${question.id}`} className="flex items-center gap-1">
              <Mic className="h-4 w-4" />
              Permite Áudio
            </Label>
            <Switch
              id={`allows-audio-${question.id}`}
              checked={question.allowsAudio}
              onCheckedChange={handleAllowsAudioChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
