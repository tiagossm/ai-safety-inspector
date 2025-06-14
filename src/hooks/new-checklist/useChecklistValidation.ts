
import { ChecklistQuestion } from "@/types/newChecklist";

export function useChecklistValidation() {
  const validateQuestion = (question: ChecklistQuestion): string[] => {
    const errors: string[] = [];
    
    // Validação do texto da pergunta
    if (!question.text || question.text.trim().length === 0) {
      errors.push("O texto da pergunta é obrigatório");
    }
    
    // Validação de opções para tipos que requerem opções
    const typesRequiringOptions = [
      'multiple_choice', 
      'dropdown', 
      'checkboxes',
      'seleção múltipla',
      'lista suspensa',
      'caixas de seleção'
    ];
    
    if (typesRequiringOptions.includes(question.responseType)) {
      if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
        errors.push("Perguntas de múltipla escolha devem ter pelo menos uma opção");
      } else {
        // Verificar se as opções têm texto válido
        const emptyOptions = question.options.filter(opt => 
          typeof opt === 'string' ? !opt.trim() : !opt.option_text?.trim()
        );
        
        if (emptyOptions.length > 0) {
          errors.push("Todas as opções devem ter texto válido");
        }
        
        // Verificar duplicatas
        const optionTexts = question.options.map(opt => 
          typeof opt === 'string' ? opt.trim().toLowerCase() : opt.option_text?.trim().toLowerCase()
        );
        const uniqueTexts = new Set(optionTexts);
        
        if (uniqueTexts.size !== optionTexts.length) {
          errors.push("Não é possível ter opções duplicadas");
        }
      }
    }
    
    return errors;
  };
  
  const validateChecklist = (questions: ChecklistQuestion[]): { isValid: boolean; errors: { [questionId: string]: string[] } } => {
    const errors: { [questionId: string]: string[] } = {};
    let isValid = true;
    
    questions.forEach(question => {
      const questionErrors = validateQuestion(question);
      if (questionErrors.length > 0) {
        errors[question.id] = questionErrors;
        isValid = false;
      }
    });
    
    return { isValid, errors };
  };
  
  const ensureValidOptions = (responseType: string, currentOptions?: any[]): string[] => {
    const typesRequiringOptions = [
      'multiple_choice', 
      'dropdown', 
      'checkboxes',
      'seleção múltipla',
      'lista suspensa',
      'caixas de seleção'
    ];
    
    if (!typesRequiringOptions.includes(responseType)) {
      return [];
    }
    
    if (!currentOptions || !Array.isArray(currentOptions) || currentOptions.length === 0) {
      return ["Opção 1", "Opção 2"];
    }
    
    return currentOptions;
  };
  
  return {
    validateQuestion,
    validateChecklist,
    ensureValidOptions
  };
}
