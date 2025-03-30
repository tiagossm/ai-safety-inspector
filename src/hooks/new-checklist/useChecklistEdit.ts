
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Checklist, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

interface SubChecklistBeingEdited {
  questionId: string;
  subChecklistId: string;
}

export function useChecklistEdit(initialChecklist: Checklist | null, checklistId: string | undefined) {
  const navigate = useNavigate();
  
  // Basic checklist info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [status, setStatus] = useState("active");
  
  // Questions and groups
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  
  // UI state
  const [viewMode, setViewMode] = useState<"all" | "by-group">("by-group");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  
  // Add state for sub-checklist editing
  const [subChecklistBeingEdited, setSubChecklistBeingEdited] = useState<SubChecklistBeingEdited | null>(null);
  
  // Initialize state when checklist data is available
  useEffect(() => {
    if (initialChecklist) {
      setTitle(initialChecklist.title || "");
      setDescription(initialChecklist.description || "");
      setCategory(initialChecklist.category || "");
      setIsTemplate(initialChecklist.is_template || false);
      setStatus(initialChecklist.status || "active");
      
      // Handle questions from different possible sources in the API response
      let checklistQuestions: ChecklistQuestion[] = [];
      
      if (initialChecklist.questions && Array.isArray(initialChecklist.questions)) {
        checklistQuestions = initialChecklist.questions;
      } else if (initialChecklist.items && Array.isArray(initialChecklist.items)) {
        // Map from items format to questions format if needed
        checklistQuestions = initialChecklist.items.map(item => ({
          id: item.id,
          text: item.pergunta || "",
          type: item.tipo_resposta || "sim/não",
          responseType: item.tipo_resposta || "sim/não",
          isRequired: item.obrigatorio,
          allowsPhoto: item.permite_foto,
          allowsVideo: item.permite_video,
          allowsAudio: item.permite_audio,
          options: item.opcoes,
          hint: item.hint,
          weight: item.weight,
          parentQuestionId: item.parent_item_id,
          conditionValue: item.condition_value,
          groupId: item.group_id || null
        }));
      }
      
      setQuestions(checklistQuestions);
      
      // Handle groups
      let checklistGroups: ChecklistGroup[] = [];
      
      if (initialChecklist.groups && Array.isArray(initialChecklist.groups)) {
        checklistGroups = initialChecklist.groups;
      } else {
        // If no groups, create a default group
        const defaultGroup = {
          id: `group-default-${Date.now()}`,
          title: "Geral",
          description: "",
          order: 0
        };
        checklistGroups = [defaultGroup];
      }
      
      setGroups(checklistGroups);
    }
  }, [initialChecklist]);
  
  // Computed properties
  const questionsByGroup = useCallback(() => {
    const result: Record<string, ChecklistQuestion[]> = {};
    
    groups.forEach(group => {
      result[group.id] = questions.filter(q => q.groupId === group.id);
    });
    
    // Add uncategorized questions to the first group
    const uncategorized = questions.filter(q => !q.groupId);
    if (uncategorized.length > 0 && groups.length > 0) {
      result[groups[0].id] = [...(result[groups[0].id] || []), ...uncategorized];
    }
    
    return result;
  }, [questions, groups]);
  
  const nonEmptyGroups = useCallback(() => {
    const qByGroup = questionsByGroup();
    return groups.filter(group => qByGroup[group.id]?.length > 0);
  }, [groups, questionsByGroup]);
  
  // Group handlers
  const handleAddGroup = () => {
    const newGroup = {
      id: `group-${Date.now()}`,
      title: `Grupo ${groups.length + 1}`,
      description: "",
      order: groups.length
    };
    
    setGroups([...groups, newGroup]);
  };
  
  const handleUpdateGroup = (id: string, updates: Partial<ChecklistGroup>) => {
    setGroups(groups.map(g => g.id === id ? { ...g, ...updates } : g));
  };
  
  const handleDeleteGroup = (id: string) => {
    // Move questions to the first group or leave without group
    const targetGroupId = groups.length > 1 ? groups[0].id : null;
    
    setQuestions(questions.map(q => 
      q.groupId === id ? { ...q, groupId: targetGroupId } : q
    ));
    
    setGroups(groups.filter(g => g.id !== id));
  };
  
  // Question handlers
  const handleAddQuestion = (groupId: string) => {
    const newQuestion: ChecklistQuestion = {
      id: `q-${Date.now()}`,
      text: "",
      type: "sim/não",
      responseType: "sim/não",
      isRequired: true,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      options: [],
      hint: "",
      weight: 1,
      parentQuestionId: null,
      conditionValue: null,
      groupId: groupId
    };
    
    setQuestions([...questions, newQuestion]);
  };
  
  const handleUpdateQuestion = (id: string, updates: Partial<ChecklistQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };
  
  const handleDeleteQuestion = (id: string) => {
    // Remove the question
    setQuestions(questions.filter(q => q.id !== id));
    
    // Store the ID for deletion if it's an existing question from the database
    if (id.indexOf('q-') !== 0) {
      setDeletedQuestionIds([...deletedQuestionIds, id]);
    }
    
    // Also remove any child questions
    const childQuestions = questions.filter(q => q.parentQuestionId === id);
    if (childQuestions.length > 0) {
      const childIds = childQuestions.map(q => q.id);
      setQuestions(questions.filter(q => !childIds.includes(q.id)));
      
      // Add existing child IDs to the deleted list
      const existingChildIds = childIds.filter(id => id.indexOf('q-') !== 0);
      if (existingChildIds.length > 0) {
        setDeletedQuestionIds([...deletedQuestionIds, ...existingChildIds]);
      }
    }
  };
  
  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // Reordering within the same group
    if (source.droppableId === destination.droppableId) {
      const groupId = source.droppableId;
      const groupQuestions = questionsByGroup()[groupId];
      
      const reordered = Array.from(groupQuestions);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);
      
      // Update all questions, replacing only those in the affected group
      const updatedQuestions = questions.filter(q => q.groupId !== groupId);
      setQuestions([...updatedQuestions, ...reordered]);
    } 
    // Moving between groups
    else {
      const sourceGroupId = source.droppableId;
      const destGroupId = destination.droppableId;
      
      const sourceQuestions = questionsByGroup()[sourceGroupId];
      const destQuestions = questionsByGroup()[destGroupId];
      
      const sourceReordered = Array.from(sourceQuestions);
      const [removed] = sourceReordered.splice(source.index, 1);
      
      // Change the group ID of the moved question
      const movedQuestion = { ...removed, groupId: destGroupId };
      
      const destReordered = Array.from(destQuestions);
      destReordered.splice(destination.index, 0, movedQuestion);
      
      // Update all questions
      const updatedQuestions = questions.filter(q => 
        q.groupId !== sourceGroupId && q.groupId !== destGroupId
      );
      
      setQuestions([
        ...updatedQuestions,
        ...sourceReordered,
        ...destReordered
      ]);
    }
  };
  
  // Handle sub-checklist editing
  const handleEditSubChecklist = (questionId: string, subChecklistId: string) => {
    setSubChecklistBeingEdited({
      questionId,
      subChecklistId
    });
  };
  
  // Save changes to the database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let checklistData: any;
      
      // Update existing checklist
      if (checklistId) {
        const { data, error } = await supabase
          .from('new_checklists')
          .update({
            title,
            description,
            category,
            is_template: isTemplate,
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', checklistId)
          .select();
        
        if (error) throw error;
        checklistData = data?.[0];
        
        // Update or create groups
        for (const group of groups) {
          if (group.id.startsWith('group-')) {
            // Create new group
            const { data: groupData, error: groupError } = await supabase
              .from('new_checklist_groups')
              .insert({
                checklist_id: checklistId,
                title: group.title,
                description: group.description,
                order: group.order
              })
              .select();
            
            if (groupError) throw groupError;
            
            // Update group ID for associated questions
            setQuestions(questions.map(q => 
              q.groupId === group.id ? { ...q, groupId: groupData?.[0]?.id } : q
            ));
          } else {
            // Update existing group
            const { error: groupError } = await supabase
              .from('new_checklist_groups')
              .update({
                title: group.title,
                description: group.description,
                order: group.order
              })
              .eq('id', group.id);
            
            if (groupError) throw groupError;
          }
        }
        
        // Delete removed questions
        if (deletedQuestionIds.length > 0) {
          const { error: deleteError } = await supabase
            .from('new_checklist_questions')
            .delete()
            .in('id', deletedQuestionIds);
          
          if (deleteError) throw deleteError;
        }
        
        // Update or create questions
        for (const question of questions) {
          if (question.id.startsWith('q-')) {
            // Create new question
            const { error: questionError } = await supabase
              .from('new_checklist_questions')
              .insert({
                checklist_id: checklistId,
                text: question.text,
                response_type: question.type,
                is_required: question.isRequired,
                allows_photo: question.allowsPhoto,
                allows_video: question.allowsVideo,
                allows_audio: question.allowsAudio,
                options: question.options,
                hint: question.hint,
                weight: question.weight,
                parent_question_id: question.parentQuestionId,
                condition_value: question.conditionValue,
                group_id: question.groupId && !question.groupId.startsWith('group-') ? question.groupId : null,
                sub_checklist_id: question.subChecklistId
              });
            
            if (questionError) throw questionError;
          } else {
            // Update existing question
            const { error: questionError } = await supabase
              .from('new_checklist_questions')
              .update({
                text: question.text,
                response_type: question.type,
                is_required: question.isRequired,
                allows_photo: question.allowsPhoto,
                allows_video: question.allowsVideo,
                allows_audio: question.allowsAudio,
                options: question.options,
                hint: question.hint,
                weight: question.weight,
                parent_question_id: question.parentQuestionId,
                condition_value: question.conditionValue,
                group_id: question.groupId && !question.groupId.startsWith('group-') ? question.groupId : null,
                sub_checklist_id: question.subChecklistId
              })
              .eq('id', question.id);
            
            if (questionError) throw questionError;
          }
        }
      } 
      // Create new checklist
      else {
        const { data, error } = await supabase
          .from('new_checklists')
          .insert({
            title,
            description,
            category,
            is_template: isTemplate,
            status
          })
          .select();
        
        if (error) throw error;
        checklistData = data?.[0];
        
        // Create groups
        for (const group of groups) {
          const { data: groupData, error: groupError } = await supabase
            .from('new_checklist_groups')
            .insert({
              checklist_id: checklistData.id,
              title: group.title,
              description: group.description,
              order: group.order
            })
            .select();
          
          if (groupError) throw groupError;
          
          // Update group ID for associated questions
          setQuestions(questions.map(q => 
            q.groupId === group.id ? { ...q, groupId: groupData?.[0]?.id } : q
          ));
        }
        
        // Create questions
        for (const question of questions) {
          const { error: questionError } = await supabase
            .from('new_checklist_questions')
            .insert({
              checklist_id: checklistData.id,
              text: question.text,
              response_type: question.type,
              is_required: question.isRequired,
              allows_photo: question.allowsPhoto,
              allows_video: question.allowsVideo,
              allows_audio: question.allowsAudio,
              options: question.options,
              hint: question.hint,
              weight: question.weight,
              parent_question_id: question.parentQuestionId,
              condition_value: question.conditionValue,
              group_id: question.groupId && !question.groupId.startsWith('group-') ? question.groupId : null,
              sub_checklist_id: question.subChecklistId
            });
          
          if (questionError) throw questionError;
        }
      }
      
      toast.success("Checklist salvo com sucesso!");
      navigate("/new-checklists");
    } catch (error: any) {
      console.error("Error saving checklist:", error);
      toast.error(`Erro ao salvar checklist: ${error.message}`);
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
    questionsByGroup: questionsByGroup(),
    nonEmptyGroups: nonEmptyGroups(),
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
    handleSubmit,
    // Sub-checklist editing
    handleEditSubChecklist,
    subChecklistBeingEdited,
    setSubChecklistBeingEdited
  };
}
