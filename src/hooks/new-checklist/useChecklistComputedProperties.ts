
import { useMemo } from "react";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

export function useChecklistComputedProperties(questions: ChecklistQuestion[], groups: ChecklistGroup[]) {
  const questionsByGroup = useMemo(() => {
    const result = new Map<string, ChecklistQuestion[]>();
    
    groups.forEach(group => {
      result.set(group.id, []);
    });
    
    questions.forEach(question => {
      const groupId = question.groupId || groups[0]?.id || "default";
      if (!result.has(groupId)) {
        result.set(groupId, []);
      }
      
      const groupQuestions = result.get(groupId) || [];
      groupQuestions.push(question);
      result.set(groupId, groupQuestions);
    });
    
    result.forEach((groupQuestions, groupId) => {
      result.set(
        groupId,
        groupQuestions.sort((a, b) => a.order - b.order)
      );
    });
    
    return result;
  }, [questions, groups]);
  
  const nonEmptyGroups = useMemo(() => {
    return groups
      .filter(group => {
        const groupQuestions = questionsByGroup.get(group.id) || [];
        return groupQuestions.length > 0;
      })
      .sort((a, b) => a.order - b.order);
  }, [groups, questionsByGroup]);

  return { questionsByGroup, nonEmptyGroups };
}
