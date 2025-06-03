
import { ChecklistQuestion } from "@/types/newChecklist";

export interface HierarchicalQuestion extends ChecklistQuestion {
  level: number;
  path: string;
  displayCondition?: any;
  isConditional?: boolean;
  children?: HierarchicalQuestion[];
  parent?: HierarchicalQuestion;
}

/**
 * Constrói uma árvore hierárquica de perguntas a partir de uma lista plana
 */
export function buildQuestionTree(questions: ChecklistQuestion[]): HierarchicalQuestion[] {
  const questionMap = new Map<string, HierarchicalQuestion>();
  const rootQuestions: HierarchicalQuestion[] = [];

  // Primeiro, cria o mapa de perguntas
  questions.forEach(question => {
    const hierarchicalQuestion: HierarchicalQuestion = {
      ...question,
      level: question.level || 0,
      path: question.path || question.id,
      displayCondition: question.displayCondition,
      isConditional: question.isConditional || false,
      children: []
    };
    questionMap.set(question.id, hierarchicalQuestion);
  });

  // Depois, constrói a hierarquia
  questions.forEach(question => {
    const hierarchicalQuestion = questionMap.get(question.id);
    if (!hierarchicalQuestion) return;

    if (question.parentQuestionId) {
      const parent = questionMap.get(question.parentQuestionId);
      if (parent) {
        hierarchicalQuestion.parent = parent;
        parent.children = parent.children || [];
        parent.children.push(hierarchicalQuestion);
      }
    } else {
      rootQuestions.push(hierarchicalQuestion);
    }
  });

  // Ordena as perguntas pela ordem
  const sortQuestions = (questions: HierarchicalQuestion[]) => {
    questions.sort((a, b) => (a.order || 0) - (b.order || 0));
    questions.forEach(question => {
      if (question.children && question.children.length > 0) {
        sortQuestions(question.children);
      }
    });
  };

  sortQuestions(rootQuestions);
  return rootQuestions;
}

/**
 * Achata uma árvore hierárquica de perguntas em uma lista plana
 */
export function flattenQuestionTree(tree: HierarchicalQuestion[]): HierarchicalQuestion[] {
  const flattened: HierarchicalQuestion[] = [];
  
  const flatten = (questions: HierarchicalQuestion[]) => {
    questions.forEach(question => {
      flattened.push(question);
      if (question.children && question.children.length > 0) {
        flatten(question.children);
      }
    });
  };
  
  flatten(tree);
  return flattened;
}

/**
 * Verifica se uma pergunta deve ser exibida baseada na condição de exibição
 */
export function shouldShowQuestion(
  question: HierarchicalQuestion, 
  responses: Record<string, any>
): boolean {
  if (!question.isConditional || !question.displayCondition) {
    return true;
  }

  try {
    const condition = question.displayCondition;
    
    if (condition.type === 'depends_on_answer') {
      const parentResponse = responses[condition.questionId];
      if (!parentResponse) return false;
      
      return condition.values.includes(parentResponse.value);
    }
    
    // Adicionar outros tipos de condições conforme necessário
    return true;
  } catch (error) {
    console.warn('Erro ao avaliar condição de exibição:', error);
    return true;
  }
}

/**
 * Filtra perguntas baseadas nas condições de exibição
 */
export function filterVisibleQuestions(
  questions: HierarchicalQuestion[], 
  responses: Record<string, any>
): HierarchicalQuestion[] {
  return questions.filter(question => {
    const shouldShow = shouldShowQuestion(question, responses);
    
    if (shouldShow && question.children && question.children.length > 0) {
      question.children = filterVisibleQuestions(question.children, responses);
    }
    
    return shouldShow;
  });
}

/**
 * Encontra uma pergunta específica na árvore hierárquica
 */
export function findQuestionInTree(
  tree: HierarchicalQuestion[], 
  questionId: string
): HierarchicalQuestion | null {
  for (const question of tree) {
    if (question.id === questionId) {
      return question;
    }
    
    if (question.children && question.children.length > 0) {
      const found = findQuestionInTree(question.children, questionId);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Obtém o caminho completo de uma pergunta na hierarquia
 */
export function getQuestionPath(question: HierarchicalQuestion): string[] {
  const path: string[] = [];
  let current: HierarchicalQuestion | undefined = question;
  
  while (current) {
    path.unshift(current.text);
    current = current.parent;
  }
  
  return path;
}

/**
 * Conta o total de perguntas em uma árvore (incluindo filhos)
 */
export function countQuestionsInTree(tree: HierarchicalQuestion[]): number {
  let count = 0;
  
  const countRecursive = (questions: HierarchicalQuestion[]) => {
    questions.forEach(question => {
      count++;
      if (question.children && question.children.length > 0) {
        countRecursive(question.children);
      }
    });
  };
  
  countRecursive(tree);
  return count;
}
