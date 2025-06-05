
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Save, Eye, Settings } from "lucide-react";

interface EditorToolbarProps {
  onAddQuestion: () => void;
  onSave: () => void;
  onPreview: () => void;
  enableAllMedia: boolean;
  onToggleAllMedia: (enabled: boolean) => void;
  totalQuestions: number;
  isSaving?: boolean;
}

export function EditorToolbar({
  onAddQuestion,
  onSave,
  onPreview,
  enableAllMedia,
  onToggleAllMedia,
  totalQuestions,
  isSaving = false
}: EditorToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={onAddQuestion} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Pergunta
          </Button>
          
          <div className="text-sm text-gray-600">
            {totalQuestions} pergunta{totalQuestions !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="enable-all-media"
              checked={enableAllMedia}
              onCheckedChange={onToggleAllMedia}
            />
            <Label htmlFor="enable-all-media" className="text-sm">
              Habilitar mídia em todas as perguntas
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onPreview}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Pré-visualizar
            </Button>

            <Button
              onClick={onSave}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Settings className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
