
import React from "react";
import { Button } from "@/components/ui/button";
import { Image, Video, Mic, FileText } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";

interface MediaOptionsToggleProps {
  question: ChecklistQuestion;
  onUpdate: (updates: Partial<ChecklistQuestion>) => void;
}

export function MediaOptionsToggle({ question, onUpdate }: MediaOptionsToggleProps) {
  const toggleMediaOption = (field: keyof ChecklistQuestion) => {
    onUpdate({ [field]: !question[field] });
  };

  const mediaOptions = [
    {
      key: 'allowsPhoto' as keyof ChecklistQuestion,
      icon: Image,
      label: 'Imagem',
      enabled: question.allowsPhoto
    },
    {
      key: 'allowsVideo' as keyof ChecklistQuestion,
      icon: Video,
      label: 'Vídeo',
      enabled: question.allowsVideo
    },
    {
      key: 'allowsAudio' as keyof ChecklistQuestion,
      icon: Mic,
      label: 'Áudio',
      enabled: question.allowsAudio
    },
    {
      key: 'allowsFiles' as keyof ChecklistQuestion,
      icon: FileText,
      label: 'Arquivos',
      enabled: question.allowsFiles
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {mediaOptions.map(({ key, icon: Icon, label, enabled }) => (
        <Button
          key={key}
          type="button"
          variant={enabled ? "default" : "outline"}
          size="sm"
          onClick={() => toggleMediaOption(key)}
          className="gap-2"
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
}
