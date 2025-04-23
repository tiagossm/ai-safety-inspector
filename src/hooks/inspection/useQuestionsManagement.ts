
import { useCallback, useMemo } from "react";

export interface Question {
  id: string;
  groupId: string;
  text: string;
  [key: string]: any;
}

export interface ResponseData {
  value?: any;
  comment?: string;
  actionPlan?: string;
  mediaUrls?: string[];
  [key: string]: any;
}

export function useQuestionsManagement(questions: Question[], responses: Record<string, ResponseData>) {
  // Normalizar questões uma única vez com useMemo
  const normalizedQuestions = useMemo(() => {
    if (!Array.isArray(questions) || questions.length === 0) {
      return [];
    }
    
    return questions.map(q => ({
      ...q,
      groupId: q.groupId || "default-group"
    }));
  }, [questions]);

  // Obter grupos únicos disponíveis nas perguntas
  const availableGroups = useMemo(() => {
    if (normalizedQuestions.length === 0) return [];
    return [...new Set(normalizedQuestions.map(q => q.groupId))];
  }, [normalizedQuestions]);

  // Filtrar questões por grupo com memoização
  const getFilteredQuestions = useCallback((groupId: string | null) => {
    if (!groupId) {
      return normalizedQuestions;
    }
    
    return normalizedQuestions.filter(q => q.groupId === groupId);
  }, [normalizedQuestions]);

  // Calcular estatísticas de conclusão com memoização
  const getCompletionStats = useCallback(() => {
    const totalQuestions = normalizedQuestions.length;
    
    if (totalQuestions === 0) {
      return { percentage: 0, answered: 0, total: 0 };
    }

    // Contar perguntas respondidas
    const answeredQuestions = Object.keys(responses || {}).filter(questionId => {
      const response = responses[questionId];
      return response?.value !== undefined && response?.value !== null;
    }).length;

    const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
    
    return { 
      percentage, 
      answered: answeredQuestions, 
      total: totalQuestions,
      availableGroups
    };
  }, [normalizedQuestions, responses, availableGroups]);

  return {
    getFilteredQuestions,
    getCompletionStats,
    availableGroups
  };
}
