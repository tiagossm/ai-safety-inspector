import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { useChecklistState } from "./useChecklistState";
import { useChecklistQuestions } from "./useChecklistQuestions";
import { useChecklistGroups } from "./useChecklistGroups";
import { useChecklistSubmit } from "./useChecklistSubmit";
import { useChecklistValidation } from "./useChecklistValidation";

export function useChecklistEdit(checklist: any, id: string | undefined) {
  const navigate = useNavigate();
  
  const state = useChecklistState(checklist);
  
  const {
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    toggleAllMediaOptions
  } = useChecklistQuestions(
    state.questions,
    state.setQuestions,
    state.groups,
    state.deletedQuestionIds,
    state.setDeletedQuestionIds
  );
  
  const {
    handleAddGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleDragEnd
  } = useChecklistGroups(
    state.groups,
    state.setGroups,
    state.questions,
    state.setQuestions
  );
  
  const { validateChecklist } = useChecklistValidation();
  
  const { handleSubmit } = useChecklistSubmit(
    id,
    state.title,
    state.description,
    state.category,
    state.isTemplate,
    state.status,
    state.questions,
    state.groups,
    state.deletedQuestionIds
  );

  useCallback(() => {
    if (checklist) {
      state.setTitle(checklist.title || "");
      state.setDescription(checklist.description || "");
      state.setCategory(checklist.category || "");
      state.setIsTemplate(checklist.isTemplate || false);
      state.setStatus(checklist.status === "inactive" ? "inactive" : "active");
      
      if (checklist.questions && checklist.questions.length > 0) {
        if (checklist.groups && checklist.groups.length > 0) {
          state.setGroups(checklist.groups);
          const questionsWithValidGroups = checklist.questions.map((q: any) => ({
            ...q,
            groupId: q.groupId || checklist.groups[0].id
          }));
          state.setQuestions(questionsWithValidGroups);
        } else {
          const defaultGroup: ChecklistGroup = {
            id: "default",
            title: "Geral",
            order: 0
          };
          const questionsWithDefaultGroup = checklist.questions.map((q: any) => ({
            ...q,
            groupId: "default"
          }));
          state.setGroups([defaultGroup]);
          state.setQuestions(questionsWithDefaultGroup);
        }
      } else {
        const defaultGroup: ChecklistGroup = {
          id: "default",
          title: "Geral",
          order: 0
        };
        const defaultQuestion: ChecklistQuestion = {
          id: `new-${Date.now()}`,
          text: "",
          responseType: "yes_no",
          isRequired: true,
          weight: 1,
          allowsPhoto: false,
          allowsVideo: false, 
          allowsAudio: false,
          allowsFiles: false,
          order: 0,
          groupId: "default"
        };
        state.setGroups([defaultGroup]);
        state.setQuestions([defaultQuestion]);
      }
    }
  }, [checklist, state]);

  const questionsByGroup = useMemo(() => {
    const result = new Map<string, ChecklistQuestion[]>();
    
    state.groups.forEach(group => {
      result.set(group.id, []);
    });
    
    state.questions.forEach(question => {
      const groupId = question.groupId || state.groups[0]?.id || "default";
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
  }, [state.questions, state.groups]);
  
  const nonEmptyGroups = useMemo(() => {
    return state.groups
      .filter(group => {
        const groupQuestions = questionsByGroup.get(group.id) || [];
        return groupQuestions.length > 0;
      })
      .sort((a, b) => a.order - b.order);
  }, [state.groups, questionsByGroup]);

  return {
    ...state,
    questionsByGroup,
    nonEmptyGroups,
    handleAddGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleDragEnd,
    handleSubmit
  };
}

export default useChecklistEdit;
