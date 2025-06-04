
import React from "react";
import { Button } from "@/components/ui/button";
import { ChecklistQuestion } from "@/types/newChecklist";
import { Trash2, Plus, Image, Video, Mic, FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface QuestionActionsProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  onDelete: (id: string) => void;
  onAddSubQuestion?: () => void;
  isSubQuestion?: boolean;
  canAddSubQuestion?: boolean;
}

export function QuestionActions({
  question,
  onUpdate,
  onDelete,
  onAddSubQuestion,
  isSubQuestion = false,
  canAddSubQuestion = false
}: QuestionActionsProps) {
  const handleMediaToggle = (field: keyof ChecklistQuestion, value: boolean) => {
    onUpdate({ ...question, [field]: value });
  };

  return (
    <div className="p-3 border-t bg-gray-50 space-y-3">
      {/* Media Options */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-gray-700">Opções de Mídia</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id={`photo-${question.id}`}
              checked={question.allowsPhoto}
              onCheckedChange={(checked) => handleMediaToggle("allowsPhoto", checked)}
              size="sm"
            />
            <Label htmlFor={`photo-${question.id}`} className="text-xs flex items-center gap-1">
              <Image className="h-3 w-3" />
              Foto
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id={`video-${question.id}`}
              checked={question.allowsVideo}
              onCheckedChange={(checked) => handleMediaToggle("allowsVideo", checked)}
              size="sm"
            />
            <Label htmlFor={`video-${question.id}`} className="text-xs flex items-center gap-1">
              <Video className="h-3 w-3" />
              Vídeo
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id={`audio-${question.id}`}
              checked={question.allowsAudio}
              onCheckedChange={(checked) => handleMediaToggle("allowsAudio", checked)}
              size="sm"
            />
            <Label htmlFor={`audio-${question.id}`} className="text-xs flex items-center gap-1">
              <Mic className="h-3 w-3" />
              Áudio
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id={`files-${question.id}`}
              checked={question.allowsFiles}
              onCheckedChange={(checked) => handleMediaToggle("allowsFiles", checked)}
              size="sm"
            />
            <Label htmlFor={`files-${question.id}`} className="text-xs flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Arquivos
            </Label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Add Sub-question Button */}
          {!isSubQuestion && canAddSubQuestion && onAddSubQuestion && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddSubQuestion}
              className="text-xs h-7"
            >
              <Plus className="h-3 w-3 mr-1" />
              Subpergunta
            </Button>
          )}
        </div>
        
        {/* Delete Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(question.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
