import { useMemo } from 'react';
import { Question, InspectionResponse } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  requiredQuestions: string[];
  missingRequiredAnswers: string[];
}

export interface ValidationError {
  questionId: string;
  message: string;
  type: 'required' | 'invalid_format' | 'missing_media';
}

export interface ValidationWarning {
  questionId: string;
  message: string;
  type: 'incomplete_media' | 'missing_action_plan' | 'no_comments';
}

export function useInspectionValidation(
  questions: Question[],
  responses: Record<string, InspectionResponse>
): ValidationResult {
  return useMemo(() => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const requiredQuestions: string[] = [];
    const missingRequiredAnswers: string[] = [];

    questions.forEach(question => {
      const response = responses[question.id];
      const isRequired = question.obrigatorio ?? question.required ?? true;
      
      if (isRequired) {
        requiredQuestions.push(question.id);
        
        // Check if required question is answered
        if (!response || response.value === undefined || response.value === null || response.value === '') {
          missingRequiredAnswers.push(question.id);
          errors.push({
            questionId: question.id,
            message: `Pergunta obrigatória não respondida: ${question.pergunta}`,
            type: 'required'
          });
        }
      }

      if (response) {
        // Check for specific validation rules based on question type
        if (question.tipo_resposta === 'email' && response.value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(response.value)) {
            errors.push({
              questionId: question.id,
              message: 'Email em formato inválido',
              type: 'invalid_format'
            });
          }
        }

        if (question.tipo_resposta === 'number' && response.value && isNaN(Number(response.value))) {
          errors.push({
            questionId: question.id,
            message: 'Valor deve ser um número',
            type: 'invalid_format'
          });
        }

        // Check for media requirements
        if ((question.permite_foto || question.permite_video) && response.value === 'Não') {
          if (!response.mediaUrls || response.mediaUrls.length === 0) {
            warnings.push({
              questionId: question.id,
              message: 'Resposta "Não" sem evidência fotográfica/vídeo',
              type: 'incomplete_media'
            });
          }
        }

        // Check for action plan when response indicates issues
        if (response.value === 'Não' || response.value === 'Não Conforme') {
          if (!response.actionPlan || response.actionPlan.trim() === '') {
            warnings.push({
              questionId: question.id,
              message: 'Não conformidade sem plano de ação',
              type: 'missing_action_plan'
            });
          }
        }

        // Check for comments on important questions
        if (question.weight && question.weight > 5) {
          if (!response.comments && !response.notes) {
            warnings.push({
              questionId: question.id,
              message: 'Questão importante sem comentários',
              type: 'no_comments'
            });
          }
        }
      }
    });

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      requiredQuestions,
      missingRequiredAnswers
    };
  }, [questions, responses]);
}