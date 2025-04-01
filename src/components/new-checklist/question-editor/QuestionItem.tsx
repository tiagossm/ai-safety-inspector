
import React, { useState } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Card } from "@/components/ui/card";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface QuestionItemProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (questionId: string) => void;
  enableAllMedia?: boolean;
}

export function QuestionItem({ question, onUpdate, onDelete, enableAllMedia = false }: QuestionItemProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Apply enableAllMedia if set
  React.useEffect(() => {
    if (enableAllMedia && (!question.allowsPhoto || !question.allowsVideo || !question.allowsAudio || !question.allowsFiles)) {
      onUpdate({
        ...question,
        allowsPhoto: true,
        allowsVideo: true,
        allowsAudio: true,
        allowsFiles: true
      });
    }
  }, [enableAllMedia, question, onUpdate]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...question,
      text: e.target.value
    });
  };
  
  const handleTypeChange = (value: string) => {
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
  
  const handleHintChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...question,
      hint: e.target.value
    });
  };
  
  const handleAllowMediaChange = (type: 'allowsPhoto' | 'allowsVideo' | 'allowsAudio' | 'allowsFiles', checked: boolean) => {
    onUpdate({
      ...question,
      [type]: checked
    });
  };
  
  return (
    <Card className="p-3 border">
      <div className="flex items-start">
        <div className="flex-grow">
          <Input
            value={question.text}
            onChange={handleTextChange}
            placeholder="Digite sua pergunta aqui"
            className="text-base mb-2"
          />
          
          <div className="flex items-center gap-2 text-sm">
            <Select
              value={question.responseType}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Tipo de resposta" />
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
            
            <div className="flex items-center gap-1">
              <Checkbox
                id={`required-${question.id}`}
                checked={question.isRequired}
                onCheckedChange={handleRequiredChange}
              />
              <label htmlFor={`required-${question.id}`} className="text-sm">
                Obrigatório
              </label>
            </div>
            
            {question.parentQuestionId && (
              <Badge variant="outline" className="text-xs">
                Sub-pergunta
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(question.id)}
          >
            <Trash2 size={18} className="text-destructive" />
          </Button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Dica para o inspetor
            </label>
            <Textarea
              value={question.hint || ""}
              onChange={handleHintChange}
              placeholder="Adicione detalhes ou instruções para quem estiver preenchendo"
              className="resize-none h-20"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Opções de mídia
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`photo-${question.id}`}
                  checked={question.allowsPhoto}
                  onCheckedChange={(checked) => 
                    handleAllowMediaChange('allowsPhoto', checked as boolean)
                  }
                  disabled={enableAllMedia}
                />
                <label htmlFor={`photo-${question.id}`} className="text-sm">
                  Permite Fotos
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`video-${question.id}`}
                  checked={question.allowsVideo}
                  onCheckedChange={(checked) => 
                    handleAllowMediaChange('allowsVideo', checked as boolean)
                  }
                  disabled={enableAllMedia}
                />
                <label htmlFor={`video-${question.id}`} className="text-sm">
                  Permite Vídeos
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`audio-${question.id}`}
                  checked={question.allowsAudio}
                  onCheckedChange={(checked) => 
                    handleAllowMediaChange('allowsAudio', checked as boolean)
                  }
                  disabled={enableAllMedia}
                />
                <label htmlFor={`audio-${question.id}`} className="text-sm">
                  Permite Áudio
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`files-${question.id}`}
                  checked={question.allowsFiles}
                  onCheckedChange={(checked) => 
                    handleAllowMediaChange('allowsFiles', checked as boolean)
                  }
                  disabled={enableAllMedia}
                />
                <label htmlFor={`files-${question.id}`} className="text-sm">
                  Permite Arquivos
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
