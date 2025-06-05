
import React, { useState, useEffect } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { ChecklistItemOption } from "@/types/multipleChoice";
import { MultipleChoiceOptionsEditor } from "./MultipleChoiceOptionsEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";

interface EnhancedOptionsSectionProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
}

export function EnhancedOptionsSection({
  question,
  onUpdate
}: EnhancedOptionsSectionProps) {
  const [internalOptions, setInternalOptions] = useState<ChecklistItemOption[]>([]);
  const [hasScoring, setHasScoring] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // Tipos que suportam opções avançadas
  const supportsAdvancedOptions = [
    'multiple_choice', 
    'checkboxes', 
    'dropdown'
  ].includes(question.responseType);

  // Inicializar opções internas a partir das opções da pergunta
  useEffect(() => {
    if (question.options && Array.isArray(question.options)) {
      const convertedOptions: ChecklistItemOption[] = question.options.map((option, index) => {
        if (typeof option === 'string') {
          return {
            id: `option-${index}-${Date.now()}`,
            item_id: question.id,
            option_text: option,
            option_value: option,
            sort_order: index,
            score: 0,
            is_correct: false,
          };
        }
        // Se já é um objeto ChecklistItemOption
        return option as ChecklistItemOption;
      });
      setInternalOptions(convertedOptions);
    } else {
      setInternalOptions([]);
    }
  }, [question.options, question.id]);

  const handleOptionsChange = (newOptions: ChecklistItemOption[]) => {
    setInternalOptions(newOptions);
    
    // Converter ChecklistItemOption[] para o formato esperado pela interface ChecklistQuestion
    // Mantemos tanto o formato string[] quanto os dados completos para compatibilidade
    const optionsForQuestion = newOptions.map(option => option.option_text);
    
    // Atualizar a pergunta com as novas opções no formato esperado
    onUpdate({
      ...question,
      options: optionsForQuestion, // string[] para compatibilidade
      // Armazenar as opções completas em uma propriedade customizada se necessário
      multipleChoiceOptions: newOptions
    });
  };

  const handleHasScoringChange = (enabled: boolean) => {
    setHasScoring(enabled);
    
    // Atualizar opções para incluir/remover scoring
    const updatedOptions = internalOptions.map(option => ({
      ...option,
      score: enabled ? (option.score || 0) : undefined
    }));
    
    handleOptionsChange(updatedOptions);
  };

  const handleShowCorrectAnswerChange = (enabled: boolean) => {
    setShowCorrectAnswer(enabled);
    
    // Atualizar opções para incluir/remover flag de resposta correta
    const updatedOptions = internalOptions.map(option => ({
      ...option,
      is_correct: enabled ? (option.is_correct || false) : undefined
    }));
    
    handleOptionsChange(updatedOptions);
  };

  if (!supportsAdvancedOptions) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações Avançadas
            <Badge variant="secondary" className="text-xs">
              {question.responseType.replace('_', ' ')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            Configure pontuação e validação para esta pergunta de múltipla escolha.
          </div>
        </CardContent>
      </Card>

      <MultipleChoiceOptionsEditor
        options={internalOptions}
        onOptionsChange={handleOptionsChange}
        hasScoring={hasScoring}
        showCorrectAnswer={showCorrectAnswer}
        onHasScoringChange={handleHasScoringChange}
        onShowCorrectAnswerChange={handleShowCorrectAnswerChange}
      />
    </div>
  );
}
