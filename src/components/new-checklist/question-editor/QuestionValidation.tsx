
import React from "react";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChecklistQuestion } from "@/types/newChecklist";

interface ValidationIssue {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  field?: string;
}

interface QuestionValidationProps {
  question: ChecklistQuestion;
  allQuestions?: ChecklistQuestion[];
}

export function QuestionValidation({ question, allQuestions = [] }: QuestionValidationProps) {
  const validateQuestion = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    // Validação obrigatória: texto da pergunta
    if (!question.text || question.text.trim().length === 0) {
      issues.push({
        type: 'error',
        message: 'Texto da pergunta é obrigatório',
        field: 'text'
      });
    }

    // Validação: pergunta muito curta
    if (question.text && question.text.trim().length < 10) {
      issues.push({
        type: 'warning',
        message: 'Pergunta muito curta, considere ser mais específico',
        field: 'text'
      });
    }

    // Validação: pergunta muito longa
    if (question.text && question.text.length > 200) {
      issues.push({
        type: 'warning',
        message: 'Pergunta muito longa, considere dividir em perguntas menores',
        field: 'text'
      });
    }

    // Validação: opções para tipos que requerem
    const typesRequiringOptions = ['multiple_choice', 'checkboxes', 'dropdown'];
    if (typesRequiringOptions.includes(question.responseType)) {
      if (!question.options || question.options.length === 0) {
        issues.push({
          type: 'error',
          message: 'Este tipo de resposta requer pelo menos uma opção',
          field: 'options'
        });
      } else if (question.options.length < 2) {
        issues.push({
          type: 'warning',
          message: 'Recomendado ter pelo menos 2 opções',
          field: 'options'
        });
      }
    }

    // Validação: peso da pergunta
    if (question.weight < 0 || question.weight > 100) {
      issues.push({
        type: 'error',
        message: 'Peso deve estar entre 0 e 100',
        field: 'weight'
      });
    }

    // Validação: perguntas condicionais
    if (question.isConditional && question.displayCondition) {
      const { rules } = question.displayCondition;
      
      // Verificar condição principal
      if (!question.displayCondition.parentQuestionId) {
        issues.push({
          type: 'error',
          message: 'Pergunta condicional deve ter uma pergunta pai selecionada',
          field: 'displayCondition'
        });
      }
      
      if (!question.displayCondition.expectedValue) {
        issues.push({
          type: 'error',
          message: 'Pergunta condicional deve ter um valor esperado definido',
          field: 'displayCondition'
        });
      }

      // Verificar regras adicionais se existirem
      if (rules && rules.length > 0) {
        rules.forEach((rule, index) => {
          if (!rule.parentQuestionId) {
            issues.push({
              type: 'error',
              message: `Regra ${index + 1}: Pergunta pai não selecionada`,
              field: 'displayCondition'
            });
          }
          if (!rule.expectedValue) {
            issues.push({
              type: 'error',
              message: `Regra ${index + 1}: Valor esperado não definido`,
              field: 'displayCondition'
            });
          }
        });
      }
    }

    // Validação: perguntas duplicadas
    const duplicates = allQuestions.filter(q => 
      q.id !== question.id && 
      q.text && 
      question.text && 
      q.text.toLowerCase().trim() === question.text.toLowerCase().trim()
    );
    
    if (duplicates.length > 0) {
      issues.push({
        type: 'warning',
        message: 'Texto similar a outra pergunta existente',
        field: 'text'
      });
    }

    // Validação: sub-checklist
    if (question.hasSubChecklist && !question.subChecklistId) {
      issues.push({
        type: 'warning',
        message: 'Sub-checklist habilitado mas ID não definido',
        field: 'subChecklistId'
      });
    }

    // Validação: dica muito longa
    if (question.hint && question.hint.length > 300) {
      issues.push({
        type: 'info',
        message: 'Dica muito longa, considere ser mais conciso',
        field: 'hint'
      });
    }

    // Validação positiva
    if (issues.filter(i => i.type === 'error').length === 0) {
      if (question.text && question.text.length >= 10) {
        issues.push({
          type: 'success',
          message: 'Pergunta válida e bem estruturada'
        });
      }
    }

    return issues;
  };

  const issues = validateQuestion();
  const hasErrors = issues.some(i => i.type === 'error');
  const hasWarnings = issues.some(i => i.type === 'warning');

  if (issues.length === 0) return null;

  const getIcon = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getTypeColor = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'success': return 'border-green-200 bg-green-50';
    }
  };

  return (
    <Card className={`mt-2 ${hasErrors ? 'border-red-300' : hasWarnings ? 'border-yellow-300' : 'border-green-300'}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={hasErrors ? 'destructive' : hasWarnings ? 'secondary' : 'default'} className="text-xs">
            {hasErrors ? 'Erros encontrados' : hasWarnings ? 'Atenção necessária' : 'Validação OK'}
          </Badge>
          <span className="text-xs text-gray-500">
            {issues.filter(i => i.type === 'error').length} erros, {issues.filter(i => i.type === 'warning').length} avisos
          </span>
        </div>

        <div className="space-y-2">
          {issues.map((issue, index) => (
            <div key={index} className={`flex items-start gap-2 p-2 rounded text-xs ${getTypeColor(issue.type)}`}>
              {getIcon(issue.type)}
              <span className="flex-1">{issue.message}</span>
              {issue.field && (
                <Badge variant="outline" className="text-xs">
                  {issue.field}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
