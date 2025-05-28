import { useCallback } from "react";
import { toast } from "sonner";
import { ChecklistQuestion } from "@/types/checklist";
import { validateBasicChecklist } from "@/validation/checklistValidation";

/**
 * Hook para validação de checklists
 * Usa o sistema de validação centralizado
 */
export function useChecklistValidation() {
  /**
   * Valida os dados básicos do checklist
   * @param title Título do checklist
   * @param category Categoria do checklist
   * @param questions Perguntas do checklist
   * @returns true se o checklist é válido, false caso contrário
   */
  const validateChecklist = useCallback((
    title: string, 
    category: string, 
    questions: ChecklistQuestion[]
  ): boolean => {
    return validateBasicChecklist(title, category, questions);
  }, []);

  /**
   * Valida uma pergunta específica
   * @param question Pergunta a ser validada
   * @returns true se a pergunta é válida, false caso contrário
   */
  const validateQuestion = useCallback((question: ChecklistQuestion): boolean => {
    // Validação básica
    if (!question.text.trim()) {
      return false;
    }
    
    // Validação específica para múltipla escolha
    if (question.responseType === "seleção múltipla") {
      if (!Array.isArray(question.options) || question.options.length < 2) {
        return false;
      }
      
      // Verifica se todas as opções são válidas
      for (const option of question.options) {
        if (!option.trim()) {
          return false;
        }
      }
    }
    
    return true;
  }, []);

  return {
    validateChecklist,
    validateQuestion
  };
}
