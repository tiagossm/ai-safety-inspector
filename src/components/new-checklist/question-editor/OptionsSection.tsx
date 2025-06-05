
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { EnhancedOptionsSection } from "./EnhancedOptionsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

interface OptionsSectionProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function OptionsSection({
  question,
  onUpdate
}: OptionsSectionProps) {
  const needsOptions = ["multiple_choice", "checkboxes", "dropdown"].includes(question.responseType);

  if (!needsOptions) {
    return null;
  }

  // Usar o novo componente aprimorado para tipos avançados
  const supportsAdvancedOptions = ['multiple_choice', 'checkboxes', 'dropdown'].includes(question.responseType);
  
  if (supportsAdvancedOptions) {
    return <EnhancedOptionsSection question={question} onUpdate={onUpdate} />;
  }

  // Fallback para tipos simples (mantém compatibilidade)
  const options = Array.isArray(question.options) ? question.options : [];

  const addOption = () => {
    const newOption = `Opção ${options.length + 1}`;
    onUpdate({
      ...question,
      options: [...options, newOption]
    });
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    onUpdate({
      ...question,
      options: updatedOptions
    });
  };

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    onUpdate({
      ...question,
      options: updatedOptions
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Opções de Resposta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((option: any, index: number) => (
          <div key={index} className="flex gap-2">
            <Input
              value={typeof option === 'string' ? option : option.option_text || ''}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Opção ${index + 1}`}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeOption(index)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Opção
        </Button>
        
        {options.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Adicione pelo menos uma opção para perguntas de múltipla escolha
          </p>
        )}
      </CardContent>
    </Card>
  );
}
