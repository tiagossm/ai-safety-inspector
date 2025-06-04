
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";

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
  canAddSubQuestion = true
}: QuestionActionsProps) {
  const handleRequiredChange = (required: boolean) => {
    onUpdate({ ...question, isRequired: required });
  };

  const handleMediaChange = (field: keyof ChecklistQuestion, value: boolean) => {
    onUpdate({ ...question, [field]: value });
  };

  return (
    <div className="p-3 bg-gray-50 border-t space-y-3">
      {/* Required Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor={`required-${question.id}`} className="text-sm">
          Pergunta obrigatória
        </Label>
        <Switch
          id={`required-${question.id}`}
          checked={question.isRequired}
          onCheckedChange={handleRequiredChange}
        />
      </div>

      {/* Media Options */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`photo-${question.id}`} className="text-sm">
            Permitir fotos
          </Label>
          <Switch
            id={`photo-${question.id}`}
            checked={question.allowsPhoto}
            onCheckedChange={(value) => handleMediaChange('allowsPhoto', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor={`video-${question.id}`} className="text-sm">
            Permitir vídeos
          </Label>
          <Switch
            id={`video-${question.id}`}
            checked={question.allowsVideo}
            onCheckedChange={(value) => handleMediaChange('allowsVideo', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor={`audio-${question.id}`} className="text-sm">
            Permitir áudio
          </Label>
          <Switch
            id={`audio-${question.id}`}
            checked={question.allowsAudio}
            onCheckedChange={(value) => handleMediaChange('allowsAudio', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor={`files-${question.id}`} className="text-sm">
            Permitir arquivos
          </Label>
          <Switch
            id={`files-${question.id}`}
            checked={question.allowsFiles}
            onCheckedChange={(value) => handleMediaChange('allowsFiles', value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          {!isSubQuestion && canAddSubQuestion && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddSubQuestion}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Subpergunta</span>
            </Button>
          )}
        </div>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(question.id)}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          <span>Excluir</span>
        </Button>
      </div>
    </div>
  );
}
