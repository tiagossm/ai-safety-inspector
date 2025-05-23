
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Question type options with descriptions - updated to include time and date
const QUESTION_TYPES = [
  { value: "sim/não", label: "Sim/Não" },
  { value: "numérico", label: "Numérico" },
  { value: "texto", label: "Texto" },
  { value: "foto", label: "Foto" },
  { value: "assinatura", label: "Assinatura" },
  { value: "seleção múltipla", label: "Múltipla Escolha" },
  { value: "hora", label: "Hora" },
  { value: "data", label: "Data" }
];

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
              <Select
                value={question.type}
                onValueChange={(value) => onChange(index, "type", value)}
              >
                <SelectTrigger id={`type-${index}`}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
