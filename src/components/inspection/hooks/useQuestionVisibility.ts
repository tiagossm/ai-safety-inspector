
import { useCallback } from "react";

export function useQuestionVisibility(
  question: any,
  allQuestions: any[]
) {
  const shouldBeVisible = useCallback(() => {
    if (!question.parentQuestionId && !question.parent_item_id) return true;
    const parentId = question.parentQuestionId || question.parent_item_id;
    const parentQuestion = allQuestions.find(q => q.id === parentId);
    if (!parentQuestion) return true;
    return true;
  }, [question.parentQuestionId, question.parent_item_id, allQuestions]);

  return { shouldBeVisible };
}
