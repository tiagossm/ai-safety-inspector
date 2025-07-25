import { useMemo } from 'react';
import { InspectionMetrics, Question, InspectionResponse } from './types';

export function useInspectionMetrics(
  questions: Question[],
  responses: Record<string, InspectionResponse>
): InspectionMetrics {
  return useMemo(() => {
    const totalQuestions = questions.length;
    
    if (totalQuestions === 0) {
      return {
        totalQuestions: 0,
        answeredQuestions: 0,
        completionPercentage: 0,
        mediaCount: 0,
        actionPlansCount: 0
      };
    }

    // Count answered questions
    const answeredQuestions = questions.filter(question => {
      const response = responses[question.id];
      return response?.value !== undefined && 
             response?.value !== null && 
             response?.value !== '';
    }).length;

    // Count media files
    const mediaCount = Object.values(responses).reduce((count, response) => {
      return count + (response?.mediaUrls?.length || 0);
    }, 0);

    // Count action plans
    const actionPlansCount = Object.values(responses).filter(
      response => response?.actionPlan && response.actionPlan.trim() !== ''
    ).length;

    // Calculate completion percentage
    const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

    // Find last save time
    const lastSaved = Object.values(responses)
      .map(response => response?.updatedAt)
      .filter(Boolean)
      .map(date => new Date(date!))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return {
      totalQuestions,
      answeredQuestions,
      completionPercentage,
      mediaCount,
      actionPlansCount,
      lastSaved
    };
  }, [questions, responses]);
}