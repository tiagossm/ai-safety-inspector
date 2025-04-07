
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { useChecklistUpdate } from "@/hooks/new-checklist/useChecklistUpdate";
import { useNavigate } from "react-router-dom";

export function useChecklistEdit(checklist: any, id: string | undefined) {
  const navigate = useNavigate();
  const updateChecklist = useChecklistUpdate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"flat" | "grouped">("flat"); // Alterado para "flat" por padrão
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  
  // Initialize form with checklist data when it loads
  useEffect(() => {
    if (checklist) {
      setTitle(checklist.title);
      setDescription(checklist.description || "");
      setCategory(checklist.category || "");
      setIsTemplate(checklist.isTemplate);
      setStatus(checklist.status);
      
      // Process questions and groups
      if (checklist.questions && checklist.questions.length > 0) {
        console.log(`Processing ${checklist.questions.length} questions for edit form`);
        
        // Initialize groups first if they exist
        if (checklist.groups && checklist.groups.length > 0) {
          console.log(`Processing ${checklist.groups.length} groups for edit form`);
          setGroups(checklist.groups);
          
          // Ensure every question has a valid groupId
          const questionsWithValidGroups = checklist.questions.map((q: ChecklistQuestion) => ({
            ...q,
            groupId: q.groupId || checklist.groups[0].id // Assign to first group if missing
          }));
          
          setQuestions(questionsWithValidGroups);
        } else {
          // If no groups defined, create a default group
          const defaultGroup: ChecklistGroup = {
            id: "default",
            title: "Geral",
            order: 0
          };
          
          const questionsWithDefaultGroup = checklist.questions.map((q: ChecklistQuestion) => ({
            ...q,
            groupId: "default"
          }));
          
          setGroups([defaultGroup]);
          setQuestions(questionsWithDefaultGroup);
        }
      } else {
        // If no questions, create a default empty question and group
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
        
        setGroups([defaultGroup]);
        setQuestions([defaultQuestion]);
        
        console.warn("No questions found for this checklist, created a default one");
      }
    }
  }, [checklist]);
  
  // Categorize questions by group for easier rendering
  const questionsByGroup = useMemo(() => {
    const result = new Map<string, ChecklistQuestion[]>();
    
    // Initialize with empty arrays for all groups
    groups.forEach(group => {
      result.set(group.id, []);
    });
    
    // Add questions to their respective groups
    questions.forEach(question => {
      const groupId = question.groupId || groups[0]?.id || "default";
      if (!result.has(groupId)) {
        // If group doesn't exist in map yet, add it
        result.set(groupId, []);
      }
      
      // Add the question to its group
      const groupQuestions = result.get(groupId) || [];
      groupQuestions.push(question);
      result.set(groupId, groupQuestions);
    });
    
    // Sort questions by order within each group
    result.forEach((groupQuestions, groupId) => {
      result.set(
        groupId,
        groupQuestions.sort((a, b) => a.order - b.order)
      );
    });
    
    return result;
  }, [questions, groups]);
  
  // Filter groups that have at least one question
  const nonEmptyGroups = useMemo(() => {
    return groups.filter(group => {
      const groupQuestions = questionsByGroup.get(group.id) || [];
      return groupQuestions.length > 0;
    }).sort((a, b) => a.order - b.order);
  }, [groups, questionsByGroup]);
  
  const handleAddGroup = () => {
    const newGroup: ChecklistGroup = {
      id: `group-${Date.now()}`,
      title: "Novo Grupo",
      order: groups.length
    };
    
    setGroups([...groups, newGroup]);
  };
  
  const handleUpdateGroup = (updatedGroup: ChecklistGroup) => {
    const index = groups.findIndex(g => g.id === updatedGroup.id);
    if (index === -1) return;
    
    const newGroups = [...groups];
    newGroups[index] = updatedGroup;
    setGroups(newGroups);
  };
  
  const handleDeleteGroup = (groupId: string) => {
    // Don't allow deleting the last group
    if (groups.length <= 1) {
      toast.warning("É necessário pelo menos um grupo.");
      return;
    }
    
    // Find the default group to move questions to
    const defaultGroup = groups[0].id !== groupId ? groups[0] : groups[1];
    
    // Move questions from deleted group to default group
    const updatedQuestions = questions.map(q => 
      q.groupId === groupId ? { ...q, groupId: defaultGroup.id } : q
    );
    
    setQuestions(updatedQuestions);
    setGroups(groups.filter(g => g.id !== groupId));
  };
  
  const handleAddQuestion = useCallback((groupId: string) => {
    const newQuestion: ChecklistQuestion = {
      id: `new-${Date.now()}-${questions.length}`,
      text: "",
      responseType: "yes_no",
      isRequired: true,
      weight: 1,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      allowsFiles: false,
      order: questionsByGroup.get(groupId)?.length || 0,
      groupId
    };
    
    setQuestions([...questions, newQuestion]);
  }, [questions, questionsByGroup]);
  
  const handleUpdateQuestion = (updatedQuestion: ChecklistQuestion) => {
    const index = questions.findIndex(q => q.id === updatedQuestion.id);
    if (index === -1) return;
    
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };
  
  const handleDeleteQuestion = (questionId: string) => {
    // Don't allow deleting if it's the only question
    if (questions.length <= 1) {
      toast.warning("O checklist deve ter pelo menos uma pergunta.");
      return;
    }
    
    // If question exists in database (not a new one), add to deleted list
    if (!questionId.startsWith("new-")) {
      setDeletedQuestionIds([...deletedQuestionIds, questionId]);
    }
    
    // Remove from current questions
    setQuestions(questions.filter(q => q.id !== questionId));
  };
  
  const handleDragEnd = (result: any) => {
    const { destination, source, type } = result;
    
    // If dropped outside a droppable area or same position
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }
    
    // Reordering groups
    if (type === "GROUP") {
      const reorderedGroups = [...groups];
      const [removed] = reorderedGroups.splice(source.index, 1);
      reorderedGroups.splice(destination.index, 0, removed);
      
      // Update order property
      const groupsWithUpdatedOrder = reorderedGroups.map((group, index) => ({
        ...group,
        order: index
      }));
      
      setGroups(groupsWithUpdatedOrder);
      return;
    }
    
    // Reordering questions within same group
    if (source.droppableId === destination.droppableId) {
      const groupQuestions = questions.filter(q => q.groupId === source.droppableId);
      const otherQuestions = questions.filter(q => q.groupId !== source.droppableId);
      
      const reorderedGroupQuestions = [...groupQuestions];
      const [removed] = reorderedGroupQuestions.splice(source.index, 1);
      reorderedGroupQuestions.splice(destination.index, 0, removed);
      
      // Update order property
      const updatedGroupQuestions = reorderedGroupQuestions.map((question, index) => ({
        ...question,
        order: index
      }));
      
      setQuestions([...otherQuestions, ...updatedGroupQuestions]);
    } 
    // Moving question between groups
    else {
      const sourceGroupQuestions = questions.filter(q => q.groupId === source.droppableId);
      const destGroupQuestions = questions.filter(q => q.groupId === destination.droppableId);
      const otherQuestions = questions.filter(
        q => q.groupId !== source.droppableId && q.groupId !== destination.droppableId
      );
      
      // Remove from source group
      const questionToMove = sourceGroupQuestions[source.index];
      const updatedSourceQuestions = [...sourceGroupQuestions];
      updatedSourceQuestions.splice(source.index, 1);
      
      // Add to destination group
      const updatedDestQuestions = [...destGroupQuestions];
      updatedDestQuestions.splice(destination.index, 0, {
        ...questionToMove,
        groupId: destination.droppableId
      });
      
      // Update order property for both groups
      const finalSourceQuestions = updatedSourceQuestions.map((q, idx) => ({ ...q, order: idx }));
      const finalDestQuestions = updatedDestQuestions.map((q, idx) => ({ ...q, order: idx }));
      
      setQuestions([...otherQuestions, ...finalSourceQuestions, ...finalDestQuestions]);
    }
  };
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (isSubmitting || !id) return false;
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!title.trim()) {
        toast.error("O título do checklist é obrigatório.");
        setIsSubmitting(false);
        return false;
      }
      
      // Filter out empty questions
      const validQuestions = questions.filter(q => q.text.trim());
      if (validQuestions.length === 0) {
        toast.error("Adicione pelo menos uma pergunta válida.");
        setIsSubmitting(false);
        return false;
      }
      
      // Prepare updated checklist data
      const updatedChecklist = {
        id,
        title,
        description,
        category,
        isTemplate,
        status
      };
      
      // Update checklist - THIS IS THE FIX:
      // Instead of passing a 'checklist' property, we directly pass the updatedChecklist object
      await updateChecklist.mutateAsync({
        ...updatedChecklist,
        questions: validQuestions,
        groups,
        deletedQuestionIds
      });
      
      toast.success("Checklist atualizado com sucesso!");
      return true;
    } catch (error) {
      console.error("Error updating checklist:", error);
      toast.error("Erro ao atualizar checklist. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    title,
    description,
    category,
    isTemplate,
    status,
    questions,
    groups,
    viewMode,
    deletedQuestionIds,
    questionsByGroup,
    nonEmptyGroups,
    isSubmitting,
    setTitle,
    setDescription,
    setCategory,
    setIsTemplate,
    setStatus,
    setQuestions,
    setGroups,
    setViewMode,
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
