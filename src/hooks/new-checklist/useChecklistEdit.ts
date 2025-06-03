import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { useChecklistState } from "./useChecklistState";
import { useChecklistQuestions } from "./useChecklistQuestions";
import { useChecklistGroups } from "./useChecklistGroups";
import { useChecklistSubmit } from "./useChecklistSubmit";
import { useChecklistValidation } from "./useChecklistValidation";
import { toast } from "sonner";

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

  const { handleSubmit, isSubmitting } = useChecklistSubmit(
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

  useEffect(() => {
    if (checklist) {
      console.log("Setting initial checklist data:", checklist);
      state.setTitle(checklist.title || "");
      state.setDescription(checklist.description || "");
      state.setCategory(checklist.category || "");
      state.setIsTemplate(checklist.isTemplate || false);
      state.setStatus(checklist.status === "inactive" ? "inactive" : "active");

      if (checklist.questions && Array.isArray(checklist.questions) && checklist.questions.length > 0) {
        console.log(`Checklist has ${checklist.questions.length} questions`);
        
        const normalizeResponseType = (type: string) => {
          if (!type) return "yes_no";
          if (type === "hora") return "time";
          if (type === "data") return "date";
          if (type === "texto") return "text";
          if (type === "sim/não") return "yes_no";
          if (type === "numérico") return "numeric";
          if (type === "assinatura") return "signature";
          if (type === "seleção múltipla") return "multiple_choice";
          if (type === "imagem") return "photo";
          return type;
        };

        if (checklist.groups && Array.isArray(checklist.groups) && checklist.groups.length > 0) {
          console.log(`Checklist has ${checklist.groups.length} groups`);
          state.setGroups(checklist.groups);
          const questionsWithValidGroups = checklist.questions.map((q: any) => ({
            ...q,
            groupId: q.groupId || checklist.groups[0].id,
            responseType: normalizeResponseType(q.responseType || q.tipo_resposta),
            level: q.level || 0,
            path: q.path || q.id,
            isConditional: q.isConditional || false
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
            groupId: "default",
            responseType: normalizeResponseType(q.responseType || q.tipo_resposta),
            level: q.level || 0,
            path: q.path || q.id,
            isConditional: q.isConditional || false
          }));
          state.setGroups([defaultGroup]);
          state.setQuestions(questionsWithDefaultGroup);
        }
      } else {
        console.log("No questions found in checklist, creating default");
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
          groupId: "default",
          level: 0,
          path: `new-${Date.now()}`,
          isConditional: false
        };
        state.setGroups([defaultGroup]);
        state.setQuestions([defaultQuestion]);
      }
    }
  }, [checklist]);

  const handleSave = async () => {
    if (isSubmitting) return false;
    
    try {
      toast.info("Salvando checklist...", { duration: 2000 });
      const success = await handleSubmit();
      
      if (success) {
        toast.success("Checklist salvo com sucesso!", { duration: 5000 });
        navigate("/new-checklists");
        return true;
      } else {
        toast.error("Erro ao salvar checklist", { duration: 5000 });
        return false;
      }
    } catch (error) {
      console.error("Error saving checklist:", error);
      toast.error(`Erro ao salvar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`, { duration: 5000 });
      return false;
    }
  };

  const handleStartInspection = async () => {
    try {
      if (!id) {
        toast.error("É necessário salvar o checklist antes de iniciar a inspeção", { duration: 5000 });
        return;
      }
      
      toast.info("Preparando inspeção...", { duration: 2000 });
      
      const saveSuccess = await handleSubmit();
      if (!saveSuccess) {
        toast.error("Não foi possível salvar o checklist antes de iniciar a inspeção", { duration: 5000 });
        return;
      }
      
      console.log(`Redirecionando para execução da inspeção com checklistId=${id}`);
      toast.success("Redirecionando para a inspeção...", { duration: 2000 });
      navigate(`/inspections/${id}/view`);
    } catch (error) {
      console.error("Error starting inspection:", error);
      toast.error(`Erro ao iniciar inspeção: ${error instanceof Error ? error.message : "Erro desconhecido"}`, { duration: 5000 });
    }
  };

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
    handleSubmit,
    handleSave,
    handleStartInspection,
    isSubmitting,
    toggleAllMediaOptions
  };
}

export default useChecklistEdit;
