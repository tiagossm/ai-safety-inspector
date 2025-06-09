
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, List } from "lucide-react";

interface UnifiedOptionsEditorProps {
  options: string[];
  onOptionsChange: (options: string[]) => void;
  questionId: string;
  responseType: string;
}

export function UnifiedOptionsEditor({
  options,
  onOptionsChange,
  questionId,
  responseType
}: UnifiedOptionsEditorProps) {
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

  const getTitle = () => {
    switch (responseType) {
      case 'multiple_choice':
        return 'Opções de Múltipla Escolha';
      case 'dropdown':
        return 'Opções da Lista Suspensa';
      case 'checkboxes':
        return 'Opções das Caixas de Seleção';
      default:
        return 'Opções';
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
          <List className="h-4 w-4" />
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Lista de opções existentes */}
        {options.length > 0 && (
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Opção ${index + 1}`}
                  className="flex-1 bg-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
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
            className="flex-1 bg-white"
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
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {options.length === 0 && (
          <p className="text-xs text-blue-600 text-center py-2">
            Nenhuma opção adicionada ainda
          </p>
        )}
      </CardContent>
    </Card>
  );
}
