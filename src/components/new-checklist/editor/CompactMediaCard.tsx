
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Image, Video, Mic, FileText } from "lucide-react";

interface CompactMediaCardProps {
  question: ChecklistQuestion;
  onUpdate: (updates: Partial<ChecklistQuestion>) => void;
}

export function CompactMediaCard({ question, onUpdate }: CompactMediaCardProps) {
  const handleMediaToggle = (mediaType: keyof Pick<ChecklistQuestion, 'allowsPhoto' | 'allowsVideo' | 'allowsAudio' | 'allowsFiles'>, enabled: boolean) => {
    onUpdate({ [mediaType]: enabled });
  };

  const hasAnyMedia = question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles;

  return (
    <div className="space-y-2">
      <Label className="text-xs text-gray-600">Recursos de Mídia</Label>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center space-x-2">
          <Switch
            id={`photo-${question.id}`}
            checked={question.allowsPhoto || false}
            onCheckedChange={(checked) => handleMediaToggle('allowsPhoto', checked)}
          />
          <Label htmlFor={`photo-${question.id}`} className="text-xs flex items-center gap-1">
            <Image className="h-3 w-3" />
            Fotos
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id={`video-${question.id}`}
            checked={question.allowsVideo || false}
            onCheckedChange={(checked) => handleMediaToggle('allowsVideo', checked)}
          />
          <Label htmlFor={`video-${question.id}`} className="text-xs flex items-center gap-1">
            <Video className="h-3 w-3" />
            Vídeos
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id={`audio-${question.id}`}
            checked={question.allowsAudio || false}
            onCheckedChange={(checked) => handleMediaToggle('allowsAudio', checked)}
          />
          <Label htmlFor={`audio-${question.id}`} className="text-xs flex items-center gap-1">
            <Mic className="h-3 w-3" />
            Áudio
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id={`files-${question.id}`}
            checked={question.allowsFiles || false}
            onCheckedChange={(checked) => handleMediaToggle('allowsFiles', checked)}
          />
          <Label htmlFor={`files-${question.id}`} className="text-xs flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Arquivos
          </Label>
        </div>
      </div>

      {!hasAnyMedia && (
        <p className="text-xs text-gray-400 text-center py-1">
          Nenhum recurso de mídia habilitado
        </p>
      )}
    </div>
  );
}
