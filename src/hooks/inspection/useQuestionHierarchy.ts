
import { useMemo } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { 
  buildQuestionTree, 
  flattenQuestionTree, 
  filterVisibleQuestions,
  findQuestionInTree,
  shouldShowQuestion,
  HierarchicalQuestion 
} from "@/utils/hierarchy/questionHierarchy";

interface UseQuestionHierarchyProps {
  questions: ChecklistQuestion[];
  responses: Record<string, any>;
}

export function useQuestionHierarchy({ questions, responses }: UseQuestionHierarchyProps) {
  // Constrói a árvore hierárquica
  const questionTree = useMemo(() => {
    return buildQuestionTree(questions);
  }, [questions]);

  // Filtra perguntas visíveis baseadas nas respostas
  const visibleQuestionTree = useMemo(() => {
    return filterVisibleQuestions(questionTree, responses);
  }, [questionTree, responses]);

  // Lista plana de perguntas visíveis
  const visibleQuestions = useMemo(() => {
    return flattenQuestionTree(visibleQuestionTree);
  }, [visibleQuestionTree]);

  // Funções utilitárias
  const findQuestion = (questionId: string): HierarchicalQuestion | null => {
    return findQuestionInTree(questionTree, questionId);
  };

  const isQuestionVisible = (questionId: string): boolean => {
    const question = findQuestion(questionId);
    if (!question) return false;
    return shouldShowQuestion(question, responses);
  };

  const getQuestionChildren = (questionId: string): HierarchicalQuestion[] => {
    const question = findQuestion(questionId);
    return question?.children || [];
  };

  const getQuestionParent = (questionId: string): HierarchicalQuestion | null => {
    const question = findQuestion(questionId);
    return question?.parent || null;
  };

  const getQuestionLevel = (questionId: string): number => {
    const question = findQuestion(questionId);
    return question?.level || 0;
  };

  const hasVisibleChildren = (questionId: string): boolean => {
    const children = getQuestionChildren(questionId);
    return children.some(child => isQuestionVisible(child.id));
  };

  return {
    questionTree,
    visibleQuestionTree,
    visibleQuestions,
    findQuestion,
    isQuestionVisible,
    getQuestionChildren,
    getQuestionParent,
    getQuestionLevel,
    hasVisibleChildren
  };
}
