
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Image, Video, Mic, FileText } from "lucide-react";

interface QuestionMediaOptionsProps {
  question: any;
  onChange: (field: string, value: any) => void;
}

export function QuestionMediaOptions({ question, onChange }: QuestionMediaOptionsProps) {
  const handleSwitchChange = (field: string) => (checked: boolean) => {
    onChange(field, checked);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-blue-500" />
            <Label htmlFor={`question-photo-${question.id}`} className="text-sm">
              Permitir foto
            </Label>
          </div>
          <Switch
            id={`question-photo-${question.id}`}
            checked={question.allowsPhoto || false}
            onCheckedChange={handleSwitchChange("allowsPhoto")}
          />
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-red-500" />
            <Label htmlFor={`question-video-${question.id}`} className="text-sm">
              Permitir vídeo
            </Label>
          </div>
          <Switch
            id={`question-video-${question.id}`}
            checked={question.allowsVideo || false}
            onCheckedChange={handleSwitchChange("allowsVideo")}
          />
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-purple-500" />
            <Label htmlFor={`question-audio-${question.id}`} className="text-sm">
              Permitir áudio
            </Label>
          </div>
          <Switch
            id={`question-audio-${question.id}`}
            checked={question.allowsAudio || false}
            onCheckedChange={handleSwitchChange("allowsAudio")}
          />
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-500" />
            <Label htmlFor={`question-files-${question.id}`} className="text-sm">
              Permitir arquivos
            </Label>
          </div>
          <Switch
            id={`question-files-${question.id}`}
            checked={question.allowsFiles || false}
            onCheckedChange={handleSwitchChange("allowsFiles")}
          />
        </div>
      </div>
    </div>
  );
}
