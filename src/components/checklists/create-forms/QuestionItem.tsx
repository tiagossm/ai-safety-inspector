
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { ResponseTypeSelector } from "@/components/common/ResponseTypeSelector";
import { 
  StandardResponseType,
  convertToDatabaseType,
  convertToFrontendType
} from "@/types/responseTypes";

interface QuestionItemProps {
  index: number;
  question: {
    text: string;
    type: string;
    required: boolean;
    allowPhoto: boolean;
    allowVideo: boolean;
    allowAudio: boolean;
    options?: string[];
    hint?: string;
    weight?: number;
    parentId?: string;
    conditionValue?: string;
  };
  onRemove: (index: number) => void;
  onChange: (index: number, field: string, value: string | boolean) => void;
}

export function QuestionItem({ index, question, onRemove, onChange }: QuestionItemProps) {
  // Converte o tipo do banco para o frontend para exibição
  const frontendType = convertToFrontendType(question.type);

  const handleResponseTypeChange = (frontendType: StandardResponseType) => {
    const dbType = convertToDatabaseType(frontendType);
    onChange(index, "type", dbType);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor={`question-${index}`}>Pergunta {index + 1}</Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <Input
            id={`question-${index}`}
            value={question.text}
            onChange={(e) => onChange(index, "text", e.target.value)}
            placeholder="Digite a pergunta..."
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`type-${index}`}>Tipo de Resposta</Label>
              <ResponseTypeSelector
                value={frontendType}
                onChange={handleResponseTypeChange}
                showDescriptions={true}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`required-${index}`}
                  checked={question.required}
                  onCheckedChange={(checked) => onChange(index, "required", checked)}
                />
                <Label htmlFor={`required-${index}`}>Obrigatório</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`allow-photo-${index}`}
                  checked={question.allowPhoto}
                  onCheckedChange={(checked) => onChange(index, "allowPhoto", checked)}
                />
                <Label htmlFor={`allow-photo-${index}`}>Permitir Foto</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`allow-video-${index}`}
                  checked={question.allowVideo}
                  onCheckedChange={(checked) => onChange(index, "allowVideo", checked)}
                />
                <Label htmlFor={`allow-video-${index}`}>Permitir Vídeo</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`allow-audio-${index}`}
                  checked={question.allowAudio}
                  onCheckedChange={(checked) => onChange(index, "allowAudio", checked)}
                />
                <Label htmlFor={`allow-audio-${index}`}>Permitir Áudio</Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
