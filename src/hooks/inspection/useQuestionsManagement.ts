
import { useCallback } from "react";

export function useQuestionsManagement(questions: any[], responses: Record<string, any>) {
  const getFilteredQuestions = useCallback((groupId: string | null) => {
    if (!groupId) return [];
    
    console.log(`Filtering questions for group ${groupId}. Total questions: ${questions.length}`);
    return questions.filter(q => q.groupId === groupId);
  }, [questions]);

  const getCompletionStats = useCallback(() => {
    const totalQuestions = questions.length;
    if (totalQuestions === 0) return { percentage: 0, answered: 0, total: 0 };

    const answered = Object.keys(responses).filter(questionId => 
      responses[questionId]?.value !== undefined && 
      responses[questionId]?.value !== null
    ).length;

    const percentage = Math.round((answered / totalQuestions) * 100);
    
    return { percentage, answered, total: totalQuestions };
  }, [questions, responses]);

  return {
    getFilteredQuestions,
    getCompletionStats
  };
}
