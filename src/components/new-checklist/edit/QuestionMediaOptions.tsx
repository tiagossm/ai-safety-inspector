
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface QuestionMediaOptionsProps {
  question: {
    allowsPhoto?: boolean;
    allowsVideo?: boolean;
    allowsAudio?: boolean;
    allowsFiles?: boolean;
  };
  onChange: (field: string, value: boolean) => void;
}

export function QuestionMediaOptions({ question, onChange }: QuestionMediaOptionsProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm text-muted-foreground">Opções de mídia</Label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="allow-photo" className="cursor-pointer text-sm">
            Permitir foto
          </Label>
          <Switch
            id="allow-photo"
            checked={question.allowsPhoto || false}
            onCheckedChange={(checked) => onChange("allowsPhoto", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="allow-video" className="cursor-pointer text-sm">
            Permitir vídeo
          </Label>
          <Switch
            id="allow-video"
            checked={question.allowsVideo || false}
            onCheckedChange={(checked) => onChange("allowsVideo", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="allow-audio" className="cursor-pointer text-sm">
            Permitir áudio
          </Label>
          <Switch
            id="allow-audio"
            checked={question.allowsAudio || false}
            onCheckedChange={(checked) => onChange("allowsAudio", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="allow-files" className="cursor-pointer text-sm">
            Permitir arquivos
          </Label>
          <Switch
            id="allow-files"
            checked={question.allowsFiles || false}
            onCheckedChange={(checked) => onChange("allowsFiles", checked)}
          />
        </div>
      </div>
    </div>
  );
}
