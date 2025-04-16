
import { useCallback } from "react";

export function useQuestionsManagement(questions: any[], responses: Record<string, any>) {
  const getFilteredQuestions = useCallback((groupId: string | null) => {
    if (!groupId) {
      console.warn("No groupId provided for filtering questions");
      return [];
    }
    
    console.log(`Filtering questions for group ${groupId}. Total questions: ${questions.length}`);
    
    // Se não há perguntas, retorna array vazio
    if (!questions || questions.length === 0) {
      console.warn(`No questions available to filter for group ${groupId}`);
      return [];
    }
    
    // Filtrar questões por ID do grupo, tratando valores nulos ou indefinidos
    const filtered = questions.filter(q => {
      // Garantir que temos um valor de groupId para comparação
      const questionGroupId = q.groupId || "default-group";
      
      // Log para debug
      console.log(`Question ${q.id} has groupId: ${questionGroupId}, comparing with: ${groupId}`);
      
      return questionGroupId === groupId || 
             (questionGroupId === null && groupId === "default-group") ||
             (questionGroupId === undefined && groupId === "default-group");
    });
    
    console.log(`Found ${filtered.length} questions for group ${groupId} from total ${questions.length}`);
    return filtered;
  }, [questions]);

  const getCompletionStats = useCallback(() => {
    const totalQuestions = questions?.length || 0;
    console.log(`Calculating stats for ${totalQuestions} questions`);
    
    if (totalQuestions === 0) {
      return { percentage: 0, answered: 0, total: 0 };
    }

    const answered = Object.keys(responses || {}).filter(questionId => 
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
