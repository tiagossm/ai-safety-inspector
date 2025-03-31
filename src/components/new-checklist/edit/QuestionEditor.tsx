
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Image, Video, Mic, Trash2, Plus } from "lucide-react";

interface QuestionEditorProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  isSubQuestion?: boolean;
}

export function QuestionEditor({ 
  question, 
  onUpdate,
  isSubQuestion = false
}: QuestionEditorProps) {
  // Atualizar o texto da pergunta
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...question,
      text: e.target.value
    });
  };
  
  // Atualizar o tipo de resposta
  const handleResponseTypeChange = (value: string) => {
    // Converter para o tipo correto
    const responseType = value as ChecklistQuestion["responseType"];
    
    // Se mudando de múltipla escolha, inicializar opções
    const options = responseType === "multiple_choice" 
      ? question.options || ["Opção 1", "Opção 2"]
      : undefined;
    
    onUpdate({
      ...question,
      responseType,
      options
    });
  };
  
  // Atualizar se a pergunta é obrigatória
  const handleRequiredChange = (checked: boolean) => {
    onUpdate({
      ...question,
      isRequired: checked
    });
  };
  
  // Atualizar peso da pergunta
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weight = parseInt(e.target.value) || 1;
    onUpdate({
      ...question,
      weight: Math.max(1, Math.min(10, weight)) // Entre 1 e 10
    });
  };
  
  // Atualizar permissões de mídia
  const handleAllowPhotoChange = (checked: boolean) => {
    onUpdate({
      ...question,
      allowsPhoto: checked
    });
  };
  
  const handleAllowVideoChange = (checked: boolean) => {
    onUpdate({
      ...question,
      allowsVideo: checked
    });
  };
  
  const handleAllowAudioChange = (checked: boolean) => {
    onUpdate({
      ...question,
      allowsAudio: checked
    });
  };
  
  // Manipular opções de múltipla escolha
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

  // Sub-checklist toggle apenas para perguntas principais
  const handleSubChecklistToggle = (checked: boolean) => {
    if (isSubQuestion) return; // Não permitir sub-checklists em sub-perguntas
    
    onUpdate({
      ...question,
      hasSubChecklist: checked,
      subChecklistId: checked ? question.subChecklistId : undefined
    });
  };
  
  return (
    <div className="space-y-4">
      <Input
        value={question.text}
        onChange={handleTextChange}
        placeholder="Digite a pergunta..."
        className="w-full"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Tipo de resposta:</label>
            <Select
              value={question.responseType}
              onValueChange={handleResponseTypeChange}
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
          
          {!isSubQuestion && (
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Possui sub-checklist?</label>
              <Switch
                checked={!!question.hasSubChecklist}
                onCheckedChange={handleSubChecklistToggle}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1 text-sm font-medium">
              <Image className="h-4 w-4" />
              Permite foto:
            </label>
            <Switch
              checked={question.allowsPhoto}
              onCheckedChange={handleAllowPhotoChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1 text-sm font-medium">
              <Video className="h-4 w-4" />
              Permite vídeo:
            </label>
            <Switch
              checked={question.allowsVideo}
              onCheckedChange={handleAllowVideoChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1 text-sm font-medium">
              <Mic className="h-4 w-4" />
              Permite áudio:
            </label>
            <Switch
              checked={question.allowsAudio}
              onCheckedChange={handleAllowAudioChange}
            />
          </div>
        </div>
      </div>
      
      {question.responseType === "multiple_choice" && question.options && (
        <div className="mt-2 border-t pt-4">
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
    </div>
  );
}
