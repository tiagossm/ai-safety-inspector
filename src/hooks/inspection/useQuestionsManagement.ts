
import { useCallback } from "react";

export function useQuestionsManagement(questions: any[], responses: Record<string, any>) {
  const getFilteredQuestions = useCallback((groupId: string | null) => {
    if (!groupId) {
      console.warn("No groupId provided for filtering questions");
      return [];
    }
    
    console.log(`Filtering questions for group ${groupId}. Total questions: ${questions.length}`);
    
    // Filtrar questões por ID do grupo, tratando valores nulos ou indefinidos
    const filtered = questions.filter(q => {
      const questionGroupId = q.groupId || "default-group";
      
      return questionGroupId === groupId || 
             (questionGroupId === null && groupId === "default-group") ||
             (questionGroupId === undefined && groupId === "default-group");
    });
    
    console.log(`Found ${filtered.length} questions for group ${groupId}`);
    return filtered;
  }, [questions]);

  const getCompletionStats = useCallback(() => {
    const totalQuestions = questions.length;
    console.log(`Calculating stats for ${totalQuestions} questions`);
    
    if (totalQuestions === 0) {
      return { percentage: 0, answered: 0, total: 0 };
    }

    const answered = Object.keys(responses).filter(questionId => 
      responses[questionId]?.value !== undefined && 
      responses[questionId]?.value !== null
    ).length;

    const percentage = Math.round((answered / totalQuestions) * 100);
    
    console.log(`Stats: ${answered}/${totalQuestions} questions answered (${percentage}%)`);
    return { percentage, answered, total: totalQuestions };
  }, [questions, responses]);

  return {
    getFilteredQuestions,
    getCompletionStats
  };
}
