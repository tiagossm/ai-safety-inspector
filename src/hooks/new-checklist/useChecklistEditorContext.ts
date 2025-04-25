import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useChecklistById } from "./useChecklistById";
import { useChecklistState } from "./useChecklistState";
import { useChecklistQuestions } from "./useChecklistQuestions";
import { useChecklistGroups } from "./useChecklistGroups";
import { useChecklistSubmit } from "./useChecklistSubmit";
import { handleError } from "@/utils/errorHandling";
import { ChecklistGroup, ChecklistQuestion } from "@/types/newChecklist";

export function useChecklistEditorContext() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { checklist, isLoading: loading, error, refetch } = useChecklistById(id || "");
  
  // Use our refactored hooks for state management
  const {
    title, setTitle,
    description, setDescription,
    category, setCategory,
    isTemplate, setIsTemplate,
    status, setStatus,
    questions, setQuestions,
    groups, setGroups,
    viewMode, setViewMode,
    deletedQuestionIds, setDeletedQuestionIds,
    isSubmitting, setIsSubmitting,
    enableAllMedia, setEnableAllMedia
  } = useChecklistState(checklist);
  
  // Questions management
  const {
    handleAddQuestion,
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
  
  // Groups management
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
  
  // Submission logic
  const {
    handleSubmit
  } = useChecklistSubmit(
    id,
    title,
    description,
    category,
    isTemplate,
    status,
    questions,
    groups,
    deletedQuestionIds
  );
  
  // Initialize form with data from the checklist when it's loaded
  useEffect(() => {
    if (checklist) {
      setTitle(checklist.title || "");
      setDescription(checklist.description || "");
      setCategory(checklist.category || "");
      setIsTemplate(checklist.isTemplate || false);
      
      // Ensure we're setting a properly typed status value
      const checklistStatus = checklist.status === "inactive" ? "inactive" : "active";
      setStatus(checklistStatus);
      
      if (checklist.questions && checklist.questions.length > 0) {
        setQuestions(checklist.questions);
        
        if (checklist.groups && checklist.groups.length > 0) {
          setGroups(checklist.groups);
        } else {
          const defaultGroup: ChecklistGroup = {
            id: "default",
            title: "Geral",
            order: 0
          };
          setGroups([defaultGroup]);
        }
      } else {
        const defaultGroup: ChecklistGroup = {
          id: "default",
          title: "Geral",
          order: 0
        };
        
        // Use a properly typed responseType value
        const defaultQuestion: ChecklistQuestion = {
          id: `new-${Date.now()}`,
          text: "",
          responseType: "yes_no", // This must be one of the allowed types
          isRequired: true,
          weight: 1,
          allowsPhoto: false,
          allowsVideo: false, 
          allowsAudio: false,
          allowsFiles: false,
          order: 0,
          groupId: "default",
          options: [] // Properly initialize options as an empty array
        };
        
        setGroups([defaultGroup]);
        setQuestions([defaultQuestion]);
      }
    }
  }, [checklist, setTitle, setDescription, setCategory, setIsTemplate, setStatus, setQuestions, setGroups]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), "Erro ao carregar checklist");
      navigate("/new-checklists");
    }
  }, [error, navigate]);
  
  // Computed properties with memoization
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
  
  // Action handlers
  const handleSave = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const success = await handleSubmit();
      setIsSubmitting(false);
      
      if (success) {
        return true;
      }
      return false;
    } catch (error) {
      setIsSubmitting(false);
      handleError(error instanceof Error ? error : new Error(String(error)), "Erro ao salvar o checklist");
      return false;
    }
  }, [handleSubmit, setIsSubmitting]);
  
  const handleStartInspection = useCallback(async () => {
    try {
      if (!id) {
        toast.error("É preciso salvar o checklist antes de iniciar uma inspeção");
        return false;
      }
      
      setIsSubmitting(true);
      // First save the checklist and only continue if save is successful
      const success = await handleSubmit();
      
      if (!success) {
        setIsSubmitting(false);
        toast.error("Erro ao preparar inspeção: Não foi possível salvar o checklist");
        return false;
      }
      
      // Corrigido o formato da URL para usar o parâmetro checklistId correto
      console.log(`Redirecionando para inspeção com checklistId=${id}`);
      toast.success("Navegando para nova inspeção...");
      navigate(`/inspections/new?checklistId=${id}`);
      setIsSubmitting(false);
      return true;
    } catch (error) {
      setIsSubmitting(false);
      handleError(error instanceof Error ? error : new Error(String(error)), "Erro ao preparar inspeção");
      return false;
    }
  }, [handleSubmit, id, navigate, setIsSubmitting]);

  return {
    // State data
    id,
    title,
    description,
    category,
    isTemplate,
    status,
    questions,
    groups,
    viewMode,
    questionsByGroup,
    nonEmptyGroups,
    isSubmitting,
    enableAllMedia,
    isLoading: loading,
    error,
    
    // Setters
    setTitle,
    setDescription,
    setCategory,
    setIsTemplate,
    setStatus,
    setViewMode,
    
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
