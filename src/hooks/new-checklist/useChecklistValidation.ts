
import { ChecklistQuestion } from "@/types/newChecklist";

// Função auxiliar para converter qualquer opção em string para validação
function extractText(opt: any): string {
  if (typeof opt === 'string') return opt.trim();
  if (opt && typeof opt === 'object' && typeof opt.option_text === 'string') return opt.option_text.trim();
  return '';
}

export function useChecklistValidation() {
  // Checa se opções são genéricas (ex: 'Opção 1', 'Opção 2', ...), duplicadas ou ruins
  const validateOptionsQuality = (options: any[]): string[] => {
    const errors: string[] = [];
    const MIN_OPTION_LENGTH = 3;
    if (!options || !Array.isArray(options) || options.length < 2) {
      errors.push("Adicione pelo menos 2 opções de resposta.");
      return errors;
    }
    // Normalizar texto das opções
    const texts = options.map(extractText);

    // Checagem de opções vazias, muito curtas ou genéricas
    texts.forEach((text, idx) => {
      if (!text) {
        errors.push(`Opção ${idx + 1} está vazia.`);
      } else if (text.length < MIN_OPTION_LENGTH) {
        errors.push(`Opção ${idx + 1} muito curta (mínimo ${MIN_OPTION_LENGTH} caracteres).`);
      } else if (/^op(ç|c)[ãa]o\s?\d+$/i.test(text)) {
        errors.push(`Opção ${idx + 1} parece ser genérica demais ("${text}").`);
      }
    });

    // Duplicatas
    const lower = texts.map(t => t.toLowerCase());
    const uniques = new Set(lower);
    if (uniques.size !== lower.length) {
      errors.push("Existem opções de resposta duplicadas.");
    }
    return errors;
  };

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
      if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
        errors.push("Perguntas de múltipla escolha devem ter pelo menos 2 opções válidas.");
      } else {
        errors.push(...validateOptionsQuality(question.options));
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
  
  // Versão que retorna opções padrão se necessário
  const ensureValidOptions = (responseType: string, currentOptions?: any[]): any[] => {
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
    if (!currentOptions || !Array.isArray(currentOptions) || currentOptions.length < 2) {
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
