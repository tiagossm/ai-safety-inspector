
import { ChecklistQuestion } from "@/types/newChecklist";

export function generateQuestionNumber(
  question: ChecklistQuestion,
  questions: ChecklistQuestion[],
  groupIndex: number = 0
): string {
  // Se for uma subpergunta, gerar numeração hierárquica
  if (question.parentQuestionId) {
    const parentQuestion = questions.find(q => q.id === question.parentQuestionId);
    if (parentQuestion) {
      const parentNumber = generateQuestionNumber(parentQuestion, questions, groupIndex);
      const siblingSubQuestions = questions.filter(q => 
        q.parentQuestionId === question.parentQuestionId
      ).sort((a, b) => a.order - b.order);
      
      const subIndex = siblingSubQuestions.findIndex(q => q.id === question.id) + 1;
      return `${parentNumber}.${subIndex}`;
    }
  }

  // Para perguntas principais, usar numeração sequencial no grupo
  const groupQuestions = questions.filter(q => 
    q.groupId === question.groupId && !q.parentQuestionId
  ).sort((a, b) => a.order - b.order);
  
  const questionIndex = groupQuestions.findIndex(q => q.id === question.id) + 1;
  
  // Se há apenas um grupo, usar numeração simples
  // Se há múltiplos grupos, usar numeração por grupo
  return groupIndex > 0 ? `${groupIndex + 1}.${questionIndex}` : `${questionIndex}`;
}

export function getQuestionDepth(question: ChecklistQuestion, questions: ChecklistQuestion[]): number {
  if (!question.parentQuestionId) return 0;
  
  const parent = questions.find(q => q.id === question.parentQuestionId);
  if (!parent) return 0;
  
  return 1 + getQuestionDepth(parent, questions);
}

export function isValidParent(
  potentialParent: ChecklistQuestion,
  child: ChecklistQuestion,
  questions: ChecklistQuestion[]
): boolean {
  // Não pode ser pai de si mesmo
  if (potentialParent.id === child.id) return false;
  
  // Verificar se não criaria ciclo
  let current = potentialParent;
  while (current.parentQuestionId) {
    if (current.parentQuestionId === child.id) return false;
    const parent = questions.find(q => q.id === current.parentQuestionId);
    if (!parent) break;
    current = parent;
  }
  
  // Limitar profundidade máxima
  const depth = getQuestionDepth(potentialParent, questions);
  return depth < 3; // Máximo 3 níveis
}
