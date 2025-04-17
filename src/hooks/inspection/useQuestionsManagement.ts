
import { useCallback } from "react";

export function useQuestionsManagement(questions: any[], responses: Record<string, any>) {
  const getFilteredQuestions = useCallback((groupId: string | null) => {
    // Enhanced debug logging
    console.log(`Filtering questions for group ${groupId || 'null'}. Total questions: ${questions?.length || 0}`);
    console.log("All questions:", questions);
    
    if (!questions || questions.length === 0) {
      console.warn("No questions available to filter");
      return [];
    }
    
    if (!groupId) {
      console.warn("No groupId provided, returning all questions");
      return questions;
    }
    
    // First ensure all questions have a valid groupId
    const normalizedQuestions = questions.map(q => ({
      ...q,
      groupId: q.groupId || "default-group"
    }));
    
    // Log unique groups for debugging
    const uniqueGroups = [...new Set(normalizedQuestions.map(q => q.groupId))];
    console.log("Available groups in questions:", uniqueGroups);
    console.log("Looking for group:", groupId);
    
    // Now filter questions by groupId
    const filtered = normalizedQuestions.filter(q => q.groupId === groupId);
    
    console.log(`Found ${filtered.length} questions for group ${groupId} (from total ${questions.length})`);
    console.log("Filtered questions:", filtered);
    return filtered;
  }, [questions]);

  const getCompletionStats = useCallback(() => {
    const totalQuestions = questions?.length || 0;
    console.log(`Calculating stats for ${totalQuestions} questions`);
    
    if (totalQuestions === 0) {
      return { percentage: 0, answered: 0, total: 0 };
    }

    // Count answered questions
    const answeredQuestions = Object.keys(responses || {}).filter(questionId => {
      const response = responses[questionId];
      return response?.value !== undefined && response?.value !== null;
    }).length;

    const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
    
    console.log(`Stats: ${answeredQuestions}/${totalQuestions} questions answered (${percentage}%)`);
    return { percentage, answered: answeredQuestions, total: totalQuestions };
  }, [questions, responses]);

  return {
    getFilteredQuestions,
    getCompletionStats
  };
}
