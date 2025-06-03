
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Button } from "@/components/ui/button";
import { Image, Video, Mic, FileText } from "lucide-react";
import { toast } from "sonner";

interface MediaSectionProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  enableAllMedia?: boolean;
}

export function MediaSection({ question, onUpdate, enableAllMedia }: MediaSectionProps) {
  const handleMediaToggle = (field: keyof ChecklistQuestion, value: boolean) => {
    const updatedQuestion = { 
      ...question, 
      [field]: value 
    };
    
    onUpdate(updatedQuestion);
    
    const mediaType = getMediaTypeName(field);
    const status = value ? "ativada" : "desativada";
    toast.success(`Opção de ${mediaType} ${status}`);
  };

  const getMediaTypeName = (mediaField: keyof ChecklistQuestion): string => {
    switch (mediaField) {
      case "allowsPhoto": return "imagem";
      case "allowsVideo": return "vídeo";
      case "allowsAudio": return "áudio";
      case "allowsFiles": return "anexo";
      default: return "mídia";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Opções de mídia
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={question.allowsPhoto ? "default" : "outline"}
          size="sm"
          className="justify-start gap-2"
          onClick={() => handleMediaToggle("allowsPhoto", !question.allowsPhoto)}
        >
          <Image className="h-4 w-4" />
          <span>Imagem</span>
        </Button>

        <Button
          type="button"
          variant={question.allowsVideo ? "default" : "outline"}
          size="sm"
          className="justify-start gap-2"
          onClick={() => handleMediaToggle("allowsVideo", !question.allowsVideo)}
        >
          <Video className="h-4 w-4" />
          <span>Vídeo</span>
        </Button>

        <Button
          type="button"
          variant={question.allowsAudio ? "default" : "outline"}
          size="sm"
          className="justify-start gap-2"
          onClick={() => handleMediaToggle("allowsAudio", !question.allowsAudio)}
        >
          <Mic className="h-4 w-4" />
          <span>Áudio</span>
        </Button>

        <Button
          type="button"
          variant={question.allowsFiles ? "default" : "outline"}
          size="sm"
          className="justify-start gap-2"
          onClick={() => handleMediaToggle("allowsFiles", !question.allowsFiles)}
        >
          <FileText className="h-4 w-4" />
          <span>Anexo</span>
        </Button>
      </div>
    </div>
  );
}
