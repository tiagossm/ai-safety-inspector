import { z } from 'zod';
import { toast } from 'sonner';
import { ResponseType } from '@/types/checklist';

// Schema para validação de opções de múltipla escolha
const optionsSchema = z.array(z.string().trim().min(1, "Opção não pode estar vazia"))
  .min(2, "Adicione pelo menos duas opções para perguntas de múltipla escolha");

// Schema para validação de perguntas
export const questionSchema = z.object({
  id: z.string(),
  text: z.string().trim().min(1, "O texto da pergunta é obrigatório"),
  responseType: z.enum([
    "sim/não", 
    "texto", 
    "numérico", 
    "seleção múltipla", 
    "foto", 
    "assinatura", 
    "data", 
    "hora"
  ]),
  isRequired: z.boolean(),
  weight: z.number().min(0, "O peso deve ser um número positivo"),
  order: z.number().int(),
  allowsPhoto: z.boolean(),
  allowsVideo: z.boolean(),
  allowsAudio: z.boolean(),
  allowsFiles: z.boolean().optional().default(false),
  options: z.union([
    z.array(z.string()).optional(),
    z.null()
  ]).optional(),
  groupId: z.string().optional(),
  hint: z.string().optional(),
  condition: z.string().optional(),
  conditionValue: z.string().optional(),
  parentQuestionId: z.string().optional(),
  hasSubChecklist: z.boolean().optional(),
  subChecklistId: z.string().optional(),
}).refine(data => {
  // Se o tipo de resposta for múltipla escolha, as opções são obrigatórias
  if (data.responseType === "seleção múltipla") {
    return Array.isArray(data.options) && data.options.length >= 2;
  }
  return true;
}, {
  message: "Perguntas de múltipla escolha precisam ter pelo menos duas opções",
  path: ["options"]
});

// Schema para validação de grupos
export const groupSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, "O título do grupo é obrigatório"),
  order: z.number().int()
});

// Schema para validação de checklist
export const checklistSchema = z.object({
  title: z.string().trim().min(1, "O título é obrigatório"),
  description: z.string().optional(),
  category: z.string().trim().min(1, "A categoria é obrigatória"),
  isTemplate: z.boolean(),
  status: z.enum(["active", "inactive"]),
  questions: z.array(questionSchema).min(1, "Adicione pelo menos uma pergunta"),
  groups: z.array(groupSchema).optional()
});

// Tipo para resultado de validação
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]> | null;
}

/**
 * Função para validar uma pergunta
 * @param question Pergunta a ser validada
 * @returns Resultado da validação
 */
export function validateQuestion(question: any): ValidationResult {
  try {
    // Validação específica para múltipla escolha
    if (question.responseType === "seleção múltipla" && (!question.options || question.options.length < 2)) {
      return {
        valid: false,
        errors: {
          options: ["Perguntas de múltipla escolha precisam ter pelo menos duas opções"]
        }
      };
    }

    // Validação geral
    questionSchema.parse(question);
    return { valid: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string[]> = {};
      
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
      });
      
      return { valid: false, errors: formattedErrors };
    }
    
    return { 
      valid: false, 
      errors: { _general: ["Erro de validação desconhecido"] } 
    };
  }
}

/**
 * Função para validar um checklist completo
 * @param data Dados do checklist a serem validados
 * @returns Resultado da validação
 */
export function validateChecklist(data: any): ValidationResult {
  try {
    checklistSchema.parse(data);
    return { valid: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string[]> = {};
      
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
      });
      
      // Mostrar erros no toast
      Object.values(formattedErrors).flat().forEach(errorMsg => {
        toast.error(errorMsg);
      });
      
      return { valid: false, errors: formattedErrors };
    }
    
    toast.error("Erro de validação desconhecido");
    return { 
      valid: false, 
      errors: { _general: ["Erro de validação desconhecido"] } 
    };
  }
}

/**
 * Função simplificada para validação básica de checklist
 * Mantida para compatibilidade com código existente
 */
export function validateBasicChecklist(title: string, category: string, questions: any[]): boolean {
  if (!title.trim()) {
    toast.error("O título é obrigatório");
    return false;
  }
  
  if (!category.trim()) {
    toast.error("A categoria é obrigatória");
    return false;
  }
  
  const validQuestions = questions.filter(q => q.text?.trim());
  if (validQuestions.length === 0) {
    toast.error("Adicione pelo menos uma pergunta válida");
    return false;
  }
  
  // Validação específica para perguntas de múltipla escolha
  const multipleChoiceQuestions = validQuestions.filter(q => q.responseType === "seleção múltipla");
  for (const q of multipleChoiceQuestions) {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      toast.error("Perguntas de múltipla escolha precisam ter pelo menos duas opções");
      return false;
    }
  }
  
  return true;
}

