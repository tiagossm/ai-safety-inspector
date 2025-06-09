
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Image, Video, Mic, FileText } from "lucide-react";

interface MediaCardProps {
  question: ChecklistQuestion;
  onUpdate: (updates: Partial<ChecklistQuestion>) => void;
}

export function MediaCard({ question, onUpdate }: MediaCardProps) {
  const handleMediaToggle = (mediaType: keyof Pick<ChecklistQuestion, 'allowsPhoto' | 'allowsVideo' | 'allowsAudio' | 'allowsFiles'>, enabled: boolean) => {
    onUpdate({ [mediaType]: enabled });
  };

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-purple-800">
          Recursos de Mídia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
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
      </CardContent>
    </Card>
  );
}
