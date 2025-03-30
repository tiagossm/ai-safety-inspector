
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistQuestion, ChecklistGroup, Checklist } from "@/types/newChecklist";

interface SubChecklistBeingEdited {
  questionId: string;
  subChecklistId: string;
}

export function useChecklistEdit(initialChecklist: Checklist | null | undefined, checklistId?: string) {
  const navigate = useNavigate();
  
  // Basic checklist information
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  
  // Questions and groups data
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [viewMode, setViewMode] = useState<"flat" | "grouped">("grouped");
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sub-checklist editing state
  const [subChecklistBeingEdited, setSubChecklistBeingEdited] = useState<SubChecklistBeingEdited | null>(null);
  
  // Initialize from initial data
  useEffect(() => {
    if (initialChecklist) {
      setTitle(initialChecklist.title || "");
      setDescription(initialChecklist.description || "");
      setCategory(initialChecklist.category || "");
      setIsTemplate(initialChecklist.isTemplate || false);
      setStatus(initialChecklist.status || "active");
      
      // Check if we have questions and groups from the initialChecklist
      if (initialChecklist.questions) {
        setQuestions(initialChecklist.questions);
      }
      
      if (initialChecklist.groups) {
        setGroups(initialChecklist.groups);
      } else if (initialChecklist.questions && initialChecklist.questions.length > 0) {
        // Create a default group if none exists
        const defaultGroup: ChecklistGroup = {
          id: uuidv4(),
          title: "General",
          order: 0
        };
        setGroups([defaultGroup]);
      }
    }
  }, [initialChecklist]);
  
  // Create a map of questions by group
  const questionsByGroup = new Map<string, ChecklistQuestion[]>();
  questions.forEach(question => {
    const groupId = question.groupId || "ungrouped";
    if (!questionsByGroup.has(groupId)) {
      questionsByGroup.set(groupId, []);
    }
    questionsByGroup.get(groupId)!.push(question);
  });
  
  // Filter out empty groups
  const nonEmptyGroups = groups.filter(group => {
    return questionsByGroup.has(group.id) && questionsByGroup.get(group.id)!.length > 0;
  });
  
  // Group actions
  const handleAddGroup = useCallback(() => {
    const newGroup: ChecklistGroup = {
      id: uuidv4(),
      title: `Group ${groups.length + 1}`,
      order: groups.length
    };
    setGroups(prev => [...prev, newGroup]);
  }, [groups]);
  
  const handleUpdateGroup = useCallback((updatedGroup: ChecklistGroup) => {
    setGroups(prev => prev.map(group => (group.id === updatedGroup.id ? updatedGroup : group)));
  }, []);
  
  const handleDeleteGroup = useCallback((groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
    
    // Move questions to ungrouped or delete them
    setQuestions(prev => prev.map(question => 
      question.groupId === groupId ? { ...question, groupId: undefined } : question
    ));
  }, []);
  
  // Question actions
  const handleAddQuestion = useCallback((groupId: string) => {
    const newQuestion: ChecklistQuestion = {
      id: uuidv4(),
      text: "",
      responseType: "yes_no",
      isRequired: true,
      options: [],
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      weight: 1,
      groupId,
      order: questionsByGroup.get(groupId)?.length || 0
    };
    setQuestions(prev => [...prev, newQuestion]);
  }, [questionsByGroup]);
  
  const handleUpdateQuestion = useCallback((updatedQuestion: ChecklistQuestion) => {
    setQuestions(prev => prev.map(q => (q.id === updatedQuestion.id ? updatedQuestion : q)));
  }, []);
  
  const handleDeleteQuestion = useCallback((questionId: string) => {
    // Add to deleted IDs list if this is an existing question
    const question = questions.find(q => q.id === questionId);
    if (question && checklistId) {
      setDeletedQuestionIds(prev => [...prev, questionId]);
    }
    
    // Remove the question
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    
    // Also remove any child questions that depend on this one
    setQuestions(prev => prev.filter(q => q.parentQuestionId !== questionId));
  }, [questions, checklistId]);
  
  const handleDragEnd = useCallback((result: any) => {
    const { destination, source, draggableId, type } = result;
    
    // If there's no destination, or if the item is dropped in the same spot
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    
    if (type === 'GROUP') {
      // Handle group reordering
      const reorderedGroups = Array.from(groups);
      const [removed] = reorderedGroups.splice(source.index, 1);
      reorderedGroups.splice(destination.index, 0, removed);
      
      // Update order property
      const updatedGroups = reorderedGroups.map((group, index) => ({
        ...group,
        order: index
      }));
      
      setGroups(updatedGroups);
    } else if (type === 'QUESTION') {
      // Handle question reordering within the same group
      if (source.droppableId === destination.droppableId) {
        const groupId = source.droppableId;
        const groupQuestions = Array.from(questionsByGroup.get(groupId) || []);
        const [removed] = groupQuestions.splice(source.index, 1);
        groupQuestions.splice(destination.index, 0, removed);
        
        // Update order property
        const updatedGroupQuestions = groupQuestions.map((question, index) => ({
          ...question,
          order: index
        }));
        
        // Update all questions
        setQuestions(prev => [
          ...prev.filter(q => q.groupId !== groupId),
          ...updatedGroupQuestions
        ]);
      } else {
        // Moving between groups
        const sourceGroupId = source.droppableId;
        const destGroupId = destination.droppableId;
        
        const sourceQuestions = Array.from(questionsByGroup.get(sourceGroupId) || []);
        const destQuestions = Array.from(questionsByGroup.get(destGroupId) || []);
        
        // Remove from source group
        const [removed] = sourceQuestions.splice(source.index, 1);
        // Add to destination group
        const updatedQuestion = { ...removed, groupId: destGroupId };
        destQuestions.splice(destination.index, 0, updatedQuestion);
        
        // Update order property for both groups
        const updatedSourceQuestions = sourceQuestions.map((question, index) => ({
          ...question,
          order: index
        }));
        
        const updatedDestQuestions = destQuestions.map((question, index) => ({
          ...question,
          order: index
        }));
        
        // Update all questions
        setQuestions(prev => [
          ...prev.filter(q => q.groupId !== sourceGroupId && q.groupId !== destGroupId),
          ...updatedSourceQuestions,
          ...updatedDestQuestions
        ]);
      }
    }
  }, [groups, questionsByGroup]);
  
  // Handle sub-checklist editing
  const handleEditSubChecklist = useCallback((questionId: string, subChecklistId: string) => {
    setSubChecklistBeingEdited({
      questionId,
      subChecklistId
    });
  }, []);
  
  // Submit the checklist
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("O título do checklist é obrigatório");
      return;
    }
    
    // Validate questions
    const validQuestions = questions.filter(q => q.text.trim());
    if (validQuestions.length === 0) {
      toast.error("O checklist deve ter pelo menos uma pergunta");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine if we're creating or updating
      if (checklistId) {
        // Update existing checklist
        const { error: updateError } = await supabase
          .from("checklists")
          .update({
            title,
            description,
            category,
            is_template: isTemplate,
            status_checklist: status,
            updated_at: new Date().toISOString()
          })
          .eq("id", checklistId);
          
        if (updateError) throw updateError;
        
        // Handle deletions first
        if (deletedQuestionIds.length > 0) {
          const { error: deleteError } = await supabase
            .from("checklist_itens")
            .delete()
            .in("id", deletedQuestionIds);
            
          if (deleteError) throw deleteError;
        }
        
        // Update or insert questions
        for (const question of validQuestions) {
          const isNewQuestion = !question.id.includes('-'); // UUID format check
          
          const questionData = {
            checklist_id: checklistId,
            pergunta: question.text,
            tipo_resposta: mapResponseTypeToDb(question.responseType),
            obrigatorio: question.isRequired,
            opcoes: question.responseType === 'multiple_choice' ? question.options : null,
            ordem: question.order || 0,
            weight: question.weight || 1,
            permite_foto: question.allowsPhoto || false,
            permite_video: question.allowsVideo || false,
            permite_audio: question.allowsAudio || false,
            parent_item_id: question.parentQuestionId,
            condition_value: question.conditionValue,
            hint: question.hint,
            sub_checklist_id: question.subChecklistId
          };
          
          if (isNewQuestion) {
            // Insert new question
            const { error: insertError } = await supabase
              .from("checklist_itens")
              .insert(questionData);
              
            if (insertError) throw insertError;
          } else {
            // Update existing question
            const { error: updateError } = await supabase
              .from("checklist_itens")
              .update(questionData)
              .eq("id", question.id);
              
            if (updateError) throw updateError;
          }
        }
        
        toast.success("Checklist atualizado com sucesso!");
      } else {
        // Create new checklist
        const { data: checklistData, error: insertError } = await supabase
          .from("checklists")
          .insert({
            title,
            description,
            category,
            is_template: isTemplate,
            status_checklist: status,
            user_id: await getCurrentUserId()
          })
          .select("id")
          .single();
          
        if (insertError) throw insertError;
        
        // Insert questions
        const questionsToInsert = validQuestions.map(question => ({
          checklist_id: checklistData.id,
          pergunta: question.text,
          tipo_resposta: mapResponseTypeToDb(question.responseType),
          obrigatorio: question.isRequired,
          opcoes: question.responseType === 'multiple_choice' ? question.options : null,
          ordem: question.order || 0,
          weight: question.weight || 1,
          permite_foto: question.allowsPhoto || false,
          permite_video: question.allowsVideo || false,
          permite_audio: question.allowsAudio || false,
          parent_item_id: question.parentQuestionId,
          condition_value: question.conditionValue,
          hint: question.hint,
          sub_checklist_id: question.subChecklistId
        }));
        
        if (questionsToInsert.length > 0) {
          const { error: questionsError } = await supabase
            .from("checklist_itens")
            .insert(questionsToInsert);
            
          if (questionsError) throw questionsError;
        }
        
        toast.success("Checklist criado com sucesso!");
        navigate(`/new-checklists/${checklistData.id}`);
      }
    } catch (error: any) {
      console.error("Error saving checklist:", error);
      toast.error(`Erro ao salvar checklist: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to map response types
  const mapResponseTypeToDb = (type: string): string => {
    const typeMap: Record<string, string> = {
      'yes_no': 'sim/não',
      'multiple_choice': 'seleção múltipla',
      'text': 'texto',
      'numeric': 'numérico',
      'photo': 'foto',
      'signature': 'assinatura'
    };
    return typeMap[type] || type;
  };
  
  // Helper to get current user ID
  const getCurrentUserId = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
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
    subChecklistBeingEdited,
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
    handleSubmit,
    handleEditSubChecklist,
    setSubChecklistBeingEdited
  };
}
