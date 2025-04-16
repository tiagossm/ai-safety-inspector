
import { useCallback } from "react";

export function useQuestionsManagement(questions: any[], responses: Record<string, any>) {
  const getFilteredQuestions = useCallback((groupId: string | null) => {
    // Log initial state for debugging
    console.log(`Filtering questions for group ${groupId}. Total questions available: ${questions?.length || 0}`);
    
    // If no groupId is provided, return empty array with a warning
    if (!groupId) {
      console.warn("No groupId provided for filtering questions");
      return [];
    }
    
    // If no questions, return empty array
    if (!questions || questions.length === 0) {
      console.warn(`No questions available to filter for group ${groupId}`);
      return [];
    }
    
    // First, ensure all questions have a valid groupId
    // If a question doesn't have a groupId, assign it to 'default-group'
    const normalizedQuestions = questions.map(q => ({
      ...q,
      groupId: q.groupId || "default-group"
    }));
    
    console.log(`Questions before filtering: ${normalizedQuestions.length}`);
    console.log("Group IDs in questions:", normalizedQuestions.map(q => q.groupId));
    
    // Now filter questions by groupId
    const filtered = normalizedQuestions.filter(q => {
      const matches = q.groupId === groupId;
      console.log(`Question ${q.id}: groupId "${q.groupId}" matches "${groupId}"? ${matches}`);
      return matches;
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

    // Count answered questions
    const answered = Object.keys(responses || {}).filter(questionId => {
      const response = responses[questionId];
      const hasValue = response?.value !== undefined && response?.value !== null;
      console.log(`Question ${questionId}: has value? ${hasValue}`);
      return hasValue;
    }).length;

    const percentage = Math.round((answered / totalQuestions) * 100);
    
    console.log(`Stats: ${answered}/${totalQuestions} questions answered (${percentage}%)`);
    return { percentage, answered, total: totalQuestions };
  }, [questions, responses]);

  return {
    getFilteredQuestions,
    getCompletionStats
  };
}
