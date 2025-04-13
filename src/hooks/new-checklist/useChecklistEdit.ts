import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { useChecklistUpdate } from "@/hooks/new-checklist/useChecklistUpdate";
import { useNavigate } from "react-router-dom";
import { validateRequiredFields, handleError } from "@/utils/errorHandling";

export function useChecklistEdit(checklist: any, id: string | undefined) {
  const navigate = useNavigate();
  const updateChecklist = useChecklistUpdate();
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"flat" | "grouped">("flat");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  
  useEffect(() => {
    if (checklist) {
      setTitle(checklist.title || "");
      setDescription(checklist.description || "");
      setCategory(checklist.category || "");
      setIsTemplate(checklist.isTemplate || false);
      setStatus(checklist.status || "active");
      
      if (checklist.questions && checklist.questions.length > 0) {
        console.log(`Processando ${checklist.questions.length} perguntas para formulário de edição`);
        
        if (checklist.groups && checklist.groups.length > 0) {
          console.log(`Processando ${checklist.groups.length} grupos para formulário de edição`);
          setGroups(checklist.groups);
          
          const questionsWithValidGroups = checklist.questions.map((q: ChecklistQuestion) => ({
            ...q,
            groupId: q.groupId || checklist.groups[0].id
          }));
          
          setQuestions(questionsWithValidGroups);
        } else {
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
        
        console.warn("Nenhuma pergunta encontrada para este checklist, criada uma padrão");
      }
    }
  }, [checklist]);
  
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
    return groups.filter(group => {
      const groupQuestions = questionsByGroup.get(group.id) || [];
      return groupQuestions.length > 0;
    }).sort((a, b) => a.order - b.order);
  }, [groups, questionsByGroup]);
  
  const handleAddGroup = useCallback(() => {
    const newGroup: ChecklistGroup = {
      id: `group-${Date.now()}`,
      title: "Novo Grupo",
      order: groups.length
    };
    
    setGroups([...groups, newGroup]);
  }, [groups]);
  
  const handleUpdateGroup = useCallback((updatedGroup: ChecklistGroup) => {
    const index = groups.findIndex(g => g.id === updatedGroup.id);
    if (index === -1) return;
    
    const newGroups = [...groups];
    newGroups[index] = updatedGroup;
    setGroups(newGroups);
  }, [groups]);
  
  const handleDeleteGroup = useCallback((groupId: string) => {
    if (groups.length <= 1) {
      toast.warning("É necessário pelo menos um grupo.");
      return;
    }
    
    const defaultGroup = groups[0].id !== groupId ? groups[0] : groups[1];
    
    const updatedQuestions = questions.map(q => 
      q.groupId === groupId ? { ...q, groupId: defaultGroup.id } : q
    );
    
    setQuestions(updatedQuestions);
    setGroups(groups.filter(g => g.id !== groupId));
  }, [groups, questions]);
  
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
      order: questions.filter(q => q.groupId === groupId).length,
      groupId
    };
    
    setQuestions([...questions, newQuestion]);
  }, [questions]);
  
  const handleUpdateQuestion = useCallback((updatedQuestion: ChecklistQuestion) => {
    const index = questions.findIndex(q => q.id === updatedQuestion.id);
    if (index === -1) return;
    
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  }, [questions]);
  
  const handleDeleteQuestion = useCallback((questionId: string) => {
    if (questions.length <= 1) {
      toast.warning("O checklist deve ter pelo menos uma pergunta.");
      return;
    }
    
    if (!questionId.startsWith("new-")) {
      setDeletedQuestionIds([...deletedQuestionIds, questionId]);
    }
    
    setQuestions(questions.filter(q => q.id !== questionId));
  }, [questions, deletedQuestionIds]);
  
  const handleDragEnd = (result: any) => {
    const { destination, source, type } = result;
    
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }
    
    if (type === "GROUP") {
      const reorderedGroups = [...groups];
      const [removed] = reorderedGroups.splice(source.index, 1);
      reorderedGroups.splice(destination.index, 0, removed);
      
      const groupsWithUpdatedOrder = reorderedGroups.map((group, index) => ({
        ...group,
        order: index
      }));
      
      setGroups(groupsWithUpdatedOrder);
      return;
    }
    
    if (source.droppableId === destination.droppableId) {
      const groupQuestions = questions.filter(q => q.groupId === source.droppableId);
      const otherQuestions = questions.filter(q => q.groupId !== source.droppableId);
      
      const reorderedGroupQuestions = [...groupQuestions];
      const [removed] = reorderedGroupQuestions.splice(source.index, 1);
      reorderedGroupQuestions.splice(destination.index, 0, removed);
      
      const updatedGroupQuestions = reorderedGroupQuestions.map((question, index) => ({
        ...question,
        order: index
      }));
      
      setQuestions([...otherQuestions, ...updatedGroupQuestions]);
    } else {
      const sourceGroupQuestions = questions.filter(q => q.groupId === source.droppableId);
      const destGroupQuestions = questions.filter(q => q.groupId === destination.droppableId);
      const otherQuestions = questions.filter(
        q => q.groupId !== source.droppableId && q.groupId !== destination.droppableId
      );
      
      const questionToMove = sourceGroupQuestions[source.index];
      const updatedSourceQuestions = [...sourceGroupQuestions];
      updatedSourceQuestions.splice(source.index, 1);
      
      const updatedDestQuestions = [...destGroupQuestions];
      updatedDestQuestions.splice(destination.index, 0, {
        ...questionToMove,
        groupId: destination.droppableId
      });
      
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
      if (!validateRequiredFields({
        título: title.trim(),
        categoria: category.trim()
      })) {
        setIsSubmitting(false);
        return false;
      }
      
      const validQuestions = questions.filter(q => q.text.trim());
      if (validQuestions.length === 0) {
        toast.error("Adicione pelo menos uma pergunta válida.");
        setIsSubmitting(false);
        return false;
      }
      
      const updatedChecklist = {
        id,
        title,
        description,
        category,
        isTemplate,
        status
      };
      
      const result = await updateChecklist.mutateAsync({
        ...updatedChecklist,
        questions: validQuestions,
        groups,
        deletedQuestionIds
      });
      
      toast.success("Checklist atualizado com sucesso!");
      return true;
    } catch (error) {
      handleError(error, "Erro ao atualizar checklist");
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
