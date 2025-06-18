import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useChecklistById } from "./useChecklistById";
import { useChecklistState } from "./useChecklistState";
import { useChecklistQuestions } from "./useChecklistQuestions";
import { useChecklistGroups } from "./useChecklistGroups";
import { useChecklistSubmit } from "./useChecklistSubmit";
import { isValidUUID } from "@/utils/uuidValidation";
import { useChecklistInitialization } from "./useChecklistInitialization";
import { useChecklistComputedProperties } from "./useChecklistComputedProperties";
import { useChecklistActions } from "./useChecklistActions";
import { useChecklistErrorHandler } from "./useChecklistErrorHandler";

export function useChecklistEditorContext() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: checklist, isLoading: loading, error, refetch } = useChecklistById(id || "");
  
  const state = useChecklistState(checklist);
  const {
    questions, setQuestions,
    groups, setGroups,
    deletedQuestionIds, setDeletedQuestionIds,
    setIsSubmitting
  } = state;
  
  useChecklistInitialization({
    checklist,
    ...state
  });
  
  useChecklistErrorHandler(error, "/new-checklists");

  const {
    handleAddQuestion: originalHandleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    toggleAllMediaOptions
  } = useChecklistQuestions(
    questions, 
    setQuestions, 
    groups, 
    deletedQuestionIds, 
    setDeletedQuestionIds
  );

  const handleAddQuestion = useCallback((groupId: string) => {
    const mainGroup = groups.find(g => g.order === 0) || groups[0];
    const realGroupId = (groupId === 'default' && mainGroup) ? mainGroup.id : groupId;
    
    if (realGroupId && isValidUUID(realGroupId)) {
      originalHandleAddQuestion(realGroupId);
    } else if (mainGroup && isValidUUID(mainGroup.id)) {
      originalHandleAddQuestion(mainGroup.id);
    } else {
      console.error("Could not find a valid group to add question to.", { groups });
      toast.error("Não foi possível adicionar a pergunta. Grupo inválido.");
    }
  }, [groups, originalHandleAddQuestion]);
  
  const {
    handleAddGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleDragEnd
  } = useChecklistGroups(
    groups,
    setGroups,
    questions,
    setQuestions
  );
  
  const { handleSubmit } = useChecklistSubmit(
    id,
    state.title,
    state.description,
    state.category,
    state.isTemplate,
    state.status,
    questions,
    groups,
    deletedQuestionIds
  );

  const { handleSave, handleStartInspection } = useChecklistActions({
    id,
    setIsSubmitting,
    handleSubmit
  });

  const { questionsByGroup, nonEmptyGroups } = useChecklistComputedProperties(questions, groups);
  
  // Função utilitária para clonar perguntas (deep copy) e gerar novos IDs para perguntas novas
  function cloneQuestionsWithNewIds(questions: ChecklistQuestion[]): ChecklistQuestion[] {
    return questions.map(q => {
      const isNew = q.id.startsWith('new-');
      return {
        ...q,
        id: isNew ? `cloned-${Date.now()}-${Math.random().toString(36).substr(2, 6)}` : q.id,
        // Se tiver subitens, clone recursivamente (se aplicável)
        options: q.options ? [...q.options] : [],
        // Adicione aqui outros campos que precisam ser copiados profundamente
      };
    });
  }

  // Exemplo de uso ao duplicar checklist:
  const handleDuplicateChecklist = useCallback(() => {
    const clonedQuestions = cloneQuestionsWithNewIds(questions);
    // Use clonedQuestions ao criar o novo checklist
    // ...existing code...
  }, [questions /*, ...outros deps */]);

  return {
    ...state,
    id,
    isLoading: loading,
    error,
    
    // Computed
    questionsByGroup,
    nonEmptyGroups,
    
    // Action handlers
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
    toggleAllMediaOptions,
    refetch
  };
}
