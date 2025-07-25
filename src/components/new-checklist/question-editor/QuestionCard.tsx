import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp, Edit } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { frontendToDatabaseResponseType } from "@/utils/responseTypeMap";

interface QuestionCardProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (questionId: string) => void;
  enableAllMedia?: boolean;
}

export function QuestionCard({ question, onUpdate, onDelete, enableAllMedia = false }: QuestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [optionsText, setOptionsText] = useState<string>(
    question.options?.join('\n') || ""
  );
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdate({
      ...question,
      text: e.target.value,
    });
  };
  
  const handleTypeChange = (value: string) => {
    onUpdate({
      ...question,
      responseType: value as any,
      options: value === "multiple_choice" && (!question.options || question.options.length === 0) 
        ? ["Opção 1", "Opção 2"] 
        : question.options,
    });
  };
  
  const handleRequiredChange = (checked: boolean) => {
    onUpdate({
      ...question,
      isRequired: checked,
    });
  };
  
  const handleMediaChange = (type: "allowsPhoto" | "allowsVideo" | "allowsAudio" | "allowsFiles", checked: boolean) => {
    onUpdate({
      ...question,
      [type]: checked,
    });
  };
  
  const handleOptionsSave = () => {
    const options = optionsText
      .split('\n')
      .map(option => option.trim())
      .filter(option => option.length > 0);
    
    onUpdate({
      ...question,
      options,
    });
    
    setShowOptions(false);
  };
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weight = parseInt(e.target.value) || 1;
    onUpdate({
      ...question,
      weight: weight < 1 ? 1 : weight > 10 ? 10 : weight,
    });
  };
  
  const handleHintChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...question,
      hint: e.target.value,
    });
  };

  // Sincroniza as opções de mídia com enableAllMedia
  useEffect(() => {
    if (onUpdate) {
      if (
        question.allowsPhoto !== enableAllMedia ||
        question.allowsVideo !== enableAllMedia ||
        question.allowsAudio !== enableAllMedia ||
        question.allowsFiles !== enableAllMedia
      ) {
        onUpdate({
          ...question,
          allowsPhoto: enableAllMedia,
          allowsVideo: enableAllMedia,
          allowsAudio: enableAllMedia,
          allowsFiles: enableAllMedia,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableAllMedia]);

  return (
    <Card className={`border ${isEditing ? "border-primary" : "border-border"}`}>
      {isEditing ? (
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`question-text-${question.id}`}>Texto da pergunta</Label>
            <Textarea
              id={`question-text-${question.id}`}
              value={question.text}
              onChange={handleTextChange}
              placeholder="Digite a pergunta aqui..."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`question-type-${question.id}`}>Tipo de resposta</Label>
              <Select
                value={question.responseType}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger id={`question-type-${question.id}`}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes_no">Sim/Não</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                  <SelectItem value="numeric">Numérico</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="time">Hora</SelectItem>
                  <SelectItem value="photo">Foto</SelectItem>
                  <SelectItem value="signature">Assinatura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`question-weight-${question.id}`}>Peso (1-10)</Label>
              <Input
                id={`question-weight-${question.id}`}
                type="number"
                min="1"
                max="10"
                value={question.weight || 1}
                onChange={handleWeightChange}
              />
            </div>
          </div>
          
          {question.responseType === "multiple_choice" && (
            <div className="space-y-3">
              <Label htmlFor={`question-options-${question.id}`}>Opções de Múltipla Escolha</Label>
              
              <div className="space-y-2">
                {(question.options || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(question.options || [])];
                        newOptions[index] = e.target.value;
                        onUpdate({
                          ...question,
                          options: newOptions,
                        });
                      }}
                      placeholder={`Opção ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newOptions = [...(question.options || [])];
                        newOptions.splice(index, 1);
                        onUpdate({
                          ...question,
                          options: newOptions,
                        });
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {(!question.options || question.options.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhuma opção adicionada
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(question.options || []), `Opção ${(question.options?.length || 0) + 1}`];
                  onUpdate({
                    ...question,
                    options: newOptions,
                  });
                }}
                className="w-full"
              >
                + Adicionar Opção
              </Button>
              
              <div className="text-xs text-muted-foreground">
                {question.options && question.options.length > 0
                  ? `${question.options.length} opção${question.options.length > 1 ? 'ões' : ''} definida${question.options.length > 1 ? 's' : ''}`
                  : "Adicione pelo menos duas opções"}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor={`question-hint-${question.id}`}>Dica/Instrução</Label>
            <Input
              id={`question-hint-${question.id}`}
              value={question.hint || ""}
              onChange={handleHintChange}
              placeholder="Instrução opcional para o inspetor"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={`question-required-${question.id}`}
                checked={question.isRequired}
                onCheckedChange={handleRequiredChange}
              />
              <Label htmlFor={`question-required-${question.id}`}>
                Resposta obrigatória
              </Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Mídia permitida</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`question-allow-photo-${question.id}`}
                  checked={enableAllMedia || question.allowsPhoto}
                  disabled={enableAllMedia}
                  onCheckedChange={(checked) => handleMediaChange("allowsPhoto", checked)}
                />
                <Label htmlFor={`question-allow-photo-${question.id}`}>
                  Foto
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`question-allow-video-${question.id}`}
                  checked={enableAllMedia || question.allowsVideo}
                  disabled={enableAllMedia}
                  onCheckedChange={(checked) => handleMediaChange("allowsVideo", checked)}
                />
                <Label htmlFor={`question-allow-video-${question.id}`}>
                  Vídeo
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`question-allow-audio-${question.id}`}
                  checked={enableAllMedia || question.allowsAudio}
                  disabled={enableAllMedia}
                  onCheckedChange={(checked) => handleMediaChange("allowsAudio", checked)}
                />
                <Label htmlFor={`question-allow-audio-${question.id}`}>
                  Áudio
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`question-allow-files-${question.id}`}
                  checked={enableAllMedia || question.allowsFiles}
                  disabled={enableAllMedia}
                  onCheckedChange={(checked) => handleMediaChange("allowsFiles", checked)}
                />
                <Label htmlFor={`question-allow-files-${question.id}`}>
                  Arquivos
                </Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Concluir Edição
            </Button>
            
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(question.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </CardContent>
      ) : (
        <>
          <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <h4 className="text-base font-medium leading-tight">
                {question.text || <span className="text-muted-foreground italic">Pergunta sem texto</span>}
              </h4>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Tipo:</span>{" "}
                {frontendToDatabaseResponseType(question.responseType)}
                {question.isRequired && " • Obrigatória"}
                {question.weight && question.weight > 1 && ` • Peso: ${question.weight}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
        </>
      )}
    </Card>
  );
}
