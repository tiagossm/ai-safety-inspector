
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChecklistQuestion } from "@/types/newChecklist";
import { useChecklistValidation } from "@/hooks/new-checklist/useChecklistValidation";

interface SmartOptionsManagerProps {
  question: ChecklistQuestion;
  onChange: (question: ChecklistQuestion) => void;
}

export function SmartOptionsManager({ question, onChange }: SmartOptionsManagerProps) {
  const { ensureValidOptions } = useChecklistValidation();
  
  // Garantir que as opções sejam válidas quando o tipo de resposta muda
  useEffect(() => {
    const typesRequiringOptions = [
      'multiple_choice', 
      'dropdown', 
      'checkboxes',
      'seleção múltipla',
      'lista suspensa',
      'caixas de seleção'
    ];
    
    if (typesRequiringOptions.includes(question.responseType)) {
      const validOptions = ensureValidOptions(question.responseType, question.options);
      if (JSON.stringify(validOptions) !== JSON.stringify(question.options)) {
        onChange({
          ...question,
          options: validOptions
        });
      }
    }
  }, [question.responseType, question.options, onChange, ensureValidOptions]);
  
  const typesRequiringOptions = [
    'multiple_choice', 
    'dropdown', 
    'checkboxes',
    'seleção múltipla',
    'lista suspensa',
    'caixas de seleção'
  ];
  
  if (!typesRequiringOptions.includes(question.responseType)) {
    return null;
  }
  
  const options = Array.isArray(question.options) ? question.options : [];
  
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange({
      ...question,
      options: newOptions
    });
  };
  
  const addOption = () => {
    const newOptions = [...options, `Opção ${options.length + 1}`];
    onChange({
      ...question,
      options: newOptions
    });
  };
  
  const removeOption = (index: number) => {
    if (options.length <= 2) {
      return; // Manter pelo menos 2 opções
    }
    
    const newOptions = options.filter((_, i) => i !== index);
    onChange({
      ...question,
      options: newOptions
    });
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Opções de Resposta
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addOption}
          className="flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Adicionar
        </Button>
      </div>
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={typeof option === 'string' ? option : option.option_text || ''}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Opção ${index + 1}`}
              className="flex-1"
            />
            {options.length > 2 && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeOption(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      {options.length < 2 && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          Adicione pelo menos 2 opções para esta pergunta
        </div>
      )}
    </div>
  );
}
