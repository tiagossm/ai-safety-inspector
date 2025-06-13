
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface SimpleOptionsEditorProps {
  options: string[];
  onOptionsChange: (options: string[]) => void;
  responseType: string;
}

export function SimpleOptionsEditor({
  options,
  onOptionsChange,
  responseType
}: SimpleOptionsEditorProps) {
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    if (newOption.trim()) {
      onOptionsChange([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onOptionsChange(newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onOptionsChange(newOptions);
  };

  const getPlaceholder = () => {
    switch (responseType) {
      case 'multiple_choice':
        return 'Opções de múltipla escolha';
      case 'dropdown':
        return 'Opções da lista suspensa';
      case 'checkboxes':
        return 'Opções das caixas de seleção';
      default:
        return 'Opções';
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-gray-600">{getPlaceholder()}</Label>
      
      {/* Lista de opções existentes */}
      {options.length > 0 && (
        <div className="space-y-1">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Opção ${index + 1}`}
                className="flex-1 h-8 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOption(index)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar nova opção */}
      <div className="flex items-center gap-2">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="Digite uma nova opção..."
          className="flex-1 h-8 text-sm"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addOption();
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          onClick={addOption}
          disabled={!newOption.trim()}
          className="h-8 px-3"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {options.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-1">
          Nenhuma opção adicionada
        </p>
      )}
    </div>
  );
}
