
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChecklistQuestion } from "@/types/newChecklist";
import { useChecklistValidation } from "@/hooks/new-checklist/useChecklistValidation";

// Função auxiliar para normalizar texto de uma opção (string ou objeto)
function getOptionText(opt: any, fallback: string): string {
  if (typeof opt === "string") return opt;
  if (opt && typeof opt === "object" && typeof opt.option_text === "string") return opt.option_text;
  return fallback;
}

interface SmartOptionsManagerProps {
  question: ChecklistQuestion;
  onChange: (question: ChecklistQuestion) => void;
}

export function SmartOptionsManager({ question, onChange }: SmartOptionsManagerProps) {
  const { ensureValidOptions, validateQuestion } = useChecklistValidation();
  
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
        const updatedQuestion = Object.assign({}, question, { options: validOptions });
        onChange(updatedQuestion);
      }
    }
    // Não dependemos do onChange aqui, só de question
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.responseType, question.options]);
  
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

  const updateQuestion = (newValues: Partial<ChecklistQuestion>) => {
    // Esta verificação garante que 'question' é um objeto válido.
    if (question && typeof question === 'object') {
      // Usando Object.assign para contornar o problema de inferência de tipo do TypeScript com o spread operator.
      const updatedQuestion = Object.assign({}, question, newValues);
      onChange(updatedQuestion);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = Array.from(options);
    if (typeof options[index] === "string" || !options[index]) {
      newOptions[index] = value;
    } else if (typeof options[index] === "object") {
      newOptions[index] = Object.assign({}, options[index], { option_text: value });
    }
    updateQuestion({ options: newOptions });
  };
  
  const addOption = () => {
    const nextIndex = options.length + 1;
    const newOptions = Array.from(options);
    newOptions.push(`Opção ${nextIndex}`);
    updateQuestion({ options: newOptions });
  };
  
  const removeOption = (index: number) => {
    if (options.length <= 2) {
      return; // Manter pelo menos 2 opções
    }
    const newOptions = options.filter((_, i) => i !== index);
    updateQuestion({ options: newOptions });
  };

  // Validação das opções (qualidade)
  const validationMessages = validateQuestion(question).filter(msg => msg.toLowerCase().includes('opç'));
  const hasQualityWarning = validationMessages.length > 0;

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

      {hasQualityWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-2 rounded flex gap-2 mb-1">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
          <div>
            <b>Atenção às opções:</b>
            <ul className="list-disc pl-5 space-y-0.5">
              {validationMessages.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={getOptionText(option, "")}
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
                title="Excluir opção"
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
