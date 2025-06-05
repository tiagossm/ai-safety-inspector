
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { StandardResponseType } from "@/types/responseTypes";
import { useChecklistItemOptions } from "@/hooks/checklist/useChecklistItemOptions";
import { ChecklistItemOption } from "@/types/multipleChoice";

interface AdvancedOptionsEditorProps {
  options: string[];
  onOptionsChange: (options: string[]) => void;
  questionId: string;
  responseType: StandardResponseType;
}

export function AdvancedOptionsEditor({
  options,
  onOptionsChange,
  questionId,
  responseType
}: AdvancedOptionsEditorProps) {
  const [newOption, setNewOption] = useState("");
  const [showScoring, setShowScoring] = useState(false);
  
  // Para questões existentes no banco, usar o hook de opções avançadas
  const { options: dbOptions, saveOptions, isSaving } = useChecklistItemOptions(questionId);

  const currentOptions = questionId.startsWith('new-') 
    ? options.map((text, index) => ({
        id: `temp-${index}`,
        item_id: questionId,
        option_text: text,
        option_value: text,
        sort_order: index,
        score: 0,
        is_correct: false
      }))
    : dbOptions;

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    if (questionId.startsWith('new-')) {
      // Para questões novas, usar o array simples
      onOptionsChange([...options, newOption.trim()]);
    } else {
      // Para questões do banco, usar opções avançadas
      const newAdvancedOption: ChecklistItemOption = {
        id: `new-${Date.now()}`,
        item_id: questionId,
        option_text: newOption.trim(),
        option_value: newOption.trim(),
        sort_order: currentOptions.length,
        score: 0,
        is_correct: false
      };
      
      saveOptions({
        itemId: questionId,
        options: [...currentOptions, newAdvancedOption]
      });
    }
    
    setNewOption("");
  };

  const handleRemoveOption = (index: number) => {
    if (questionId.startsWith('new-')) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      onOptionsChange(newOptions);
    } else {
      const newOptions = [...currentOptions];
      newOptions.splice(index, 1);
      saveOptions({
        itemId: questionId,
        options: newOptions
      });
    }
  };

  const handleUpdateOption = (index: number, field: keyof ChecklistItemOption, value: any) => {
    if (questionId.startsWith('new-')) {
      if (field === 'option_text') {
        const newOptions = [...options];
        newOptions[index] = value;
        onOptionsChange(newOptions);
      }
    } else {
      const newOptions = [...currentOptions];
      newOptions[index] = { ...newOptions[index], [field]: value };
      saveOptions({
        itemId: questionId,
        options: newOptions
      });
    }
  };

  const supportsScoring = ['multiple_choice', 'checkboxes'].includes(responseType);

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Opções de resposta</Label>
        {supportsScoring && (
          <div className="flex items-center gap-2">
            <Label htmlFor="enable-scoring" className="text-xs">
              Habilitar pontuação
            </Label>
            <Switch
              id="enable-scoring"
              checked={showScoring}
              onCheckedChange={setShowScoring}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        {currentOptions.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2 p-2 bg-white rounded border">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            
            <div className="flex-1">
              <Input
                value={option.option_text}
                onChange={(e) => handleUpdateOption(index, 'option_text', e.target.value)}
                placeholder={`Opção ${index + 1}`}
                className="text-sm"
              />
            </div>

            {showScoring && supportsScoring && (
              <>
                <div className="w-20">
                  <Input
                    type="number"
                    value={option.score || 0}
                    onChange={(e) => handleUpdateOption(index, 'score', Number(e.target.value))}
                    placeholder="Pontos"
                    className="text-sm"
                  />
                </div>
                
                <div className="flex items-center gap-1">
                  <Switch
                    checked={option.is_correct || false}
                    onCheckedChange={(checked) => handleUpdateOption(index, 'is_correct', checked)}
                  />
                  <Label className="text-xs text-gray-600">Correta</Label>
                </div>
              </>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveOption(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="Digite uma nova opção..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddOption();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddOption}
          disabled={!newOption.trim() || isSaving}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {currentOptions.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Nenhuma opção adicionada ainda. Adicione pelo menos uma opção.
        </div>
      )}
    </div>
  );
}
