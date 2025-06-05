
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChecklistItemOption, MultipleChoiceResponse } from "@/types/multipleChoice";
import { Award, CheckCircle } from "lucide-react";

interface MultipleChoiceRendererProps {
  options: ChecklistItemOption[];
  value?: MultipleChoiceResponse;
  onChange?: (value: MultipleChoiceResponse) => void;
  allowsMultiple?: boolean;
  hasScoring?: boolean;
  showCorrectAnswer?: boolean;
  readOnly?: boolean;
  variant?: 'buttons' | 'dropdown' | 'checkboxes';
}

export function MultipleChoiceRenderer({
  options,
  value,
  onChange,
  allowsMultiple = false,
  hasScoring = false,
  showCorrectAnswer = false,
  readOnly = false,
  variant = 'buttons'
}: MultipleChoiceRendererProps) {
  const selectedOptions = value?.selectedOptions || [];

  const handleOptionSelect = (optionId: string) => {
    if (readOnly) return;

    let newSelected: string[];

    if (allowsMultiple) {
      newSelected = selectedOptions.includes(optionId)
        ? selectedOptions.filter(id => id !== optionId)
        : [...selectedOptions, optionId];
    } else {
      newSelected = selectedOptions.includes(optionId) ? [] : [optionId];
    }

    // Calcular pontuação se aplicável
    let score = 0;
    if (hasScoring) {
      score = newSelected.reduce((total, id) => {
        const option = options.find(opt => opt.id === id);
        return total + (option?.score || 0);
      }, 0);
    }

    // Verificar se está correto se aplicável
    let isCorrect = false;
    if (showCorrectAnswer) {
      const correctOptions = options.filter(opt => opt.is_correct).map(opt => opt.id);
      isCorrect = correctOptions.length === newSelected.length && 
                  correctOptions.every(id => newSelected.includes(id));
    }

    onChange?.({
      selectedOptions: newSelected,
      score: hasScoring ? score : undefined,
      isCorrect: showCorrectAnswer ? isCorrect : undefined
    });
  };

  if (variant === 'dropdown') {
    return (
      <select
        className="w-full p-2 border rounded-md"
        value={selectedOptions[0] || ''}
        onChange={(e) => handleOptionSelect(e.target.value)}
        disabled={readOnly}
      >
        <option value="">Selecione uma opção...</option>
        {options
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((option) => (
            <option key={option.id} value={option.id}>
              {option.option_text}
              {hasScoring && ` (${option.score} pts)`}
            </option>
          ))}
      </select>
    );
  }

  if (variant === 'checkboxes') {
    return (
      <div className="space-y-2">
        {options
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.id)}
                onChange={() => handleOptionSelect(option.id)}
                disabled={readOnly}
                className="rounded"
              />
              <span className="flex-1">{option.option_text}</span>
              {hasScoring && (
                <Badge variant="secondary" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {option.score} pts
                </Badge>
              )}
              {showCorrectAnswer && option.is_correct && (
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Correta
                </Badge>
              )}
            </label>
          ))}
      </div>
    );
  }

  // Variant 'buttons' (default)
  return (
    <div className="grid grid-cols-1 gap-2">
      {options
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-colors ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-muted-foreground/50'
              } ${readOnly ? 'cursor-not-allowed' : ''}`}
              onClick={() => handleOptionSelect(option.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <span className="flex-1">{option.option_text}</span>
                  <div className="flex items-center gap-2">
                    {hasScoring && (
                      <Badge variant="secondary" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {option.score} pts
                      </Badge>
                    )}
                    {showCorrectAnswer && option.is_correct && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Correta
                      </Badge>
                    )}
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
