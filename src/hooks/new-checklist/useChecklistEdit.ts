import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import {
  Checklist,
  ChecklistItem,
  ChecklistQuestion,
  ChecklistGroup
} from "@/types/newChecklist";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { frontendToDatabaseResponseType } from "@/utils/responseTypeMap";

interface UseChecklistEditProps {
  checklistId?: string;
}

export function useChecklistEdit(checklistId?: string) {
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [checklistData, setChecklistData] = useState<Checklist | null>(null);

  // Fetch checklist data
  const { data: checklist, isLoading: isChecklistLoading } = useQuery({
    queryKey: ["checklist", checklistId],
    queryFn: async () => {
      if (!checklistId) return null;

      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", checklistId)
        .single();

      if (error) {
        console.error("Error fetching checklist:", error);
        throw error;
      }

      // Garantir que o origin seja um valor válido e fazer casting correto
      const validOrigin: 'manual' | 'ia' | 'csv' = (['manual', 'ia', 'csv'] as const).includes(data.origin as any) 
        ? (data.origin as 'manual' | 'ia' | 'csv')
        : 'manual';

      const checklistWithValidOrigin: Checklist = {
        id: data.id,
        title: data.title,
        description: data.description,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status,
        status_checklist: data.status_checklist,
        is_template: data.is_template,
        user_id: data.user_id,
        company_id: data.company_id,
        responsible_id: data.responsible_id,
        category: data.category,
        origin: validOrigin,
        questions: undefined, // Será carregado separadamente
        groups: undefined, // Será carregado separadamente
        responsibleName: undefined // Poderia ser carregado com JOIN se necessário
      };

      setChecklistData(checklistWithValidOrigin);
      return checklistWithValidOrigin;
    },
    enabled: !!checklistId,
  });

  // Fetch questions
  const { data: fetchedQuestions, isLoading: isQuestionsLoading } = useQuery({
    queryKey: ["checklist-questions", checklistId],
    queryFn: async () => {
      if (!checklistId) return [];

      const { data, error } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", checklistId)
        .order("ordem", { ascending: true });

      if (error) {
        console.error("Error fetching questions:", error);
        throw error;
      }

      const typedQuestions = data.map(item => ({
        id: item.id,
        text: item.pergunta,
        responseType: item.tipo_resposta,
        isRequired: item.obrigatorio,
        order: item.ordem,
        weight: item.weight || 1,
        allowsPhoto: item.permite_foto || false,
        allowsVideo: item.permite_video || false,
        allowsAudio: item.permite_audio || false,
        allowsFiles: item.permite_files || false,
        options: item.opcoes || [],
        groupId: "default", // Valor padrão até implementarmos grupos completamente
        level: 0,
        path: item.id,
        isConditional: item.is_conditional || false,
        parentQuestionId: item.parent_item_id,
        conditionValue: item.condition_value,
        displayCondition: item.display_condition,
        hasSubChecklist: item.has_subchecklist,
        subChecklistId: item.sub_checklist_id,
      })) as ChecklistQuestion[];

      setQuestions(typedQuestions);
      return typedQuestions;
    },
    enabled: !!checklistId,
  });

  // Fetch groups
  const { data: fetchedGroups, isLoading: isGroupsLoading } = useQuery({
    queryKey: ["checklist-groups", checklistId],
    queryFn: async () => {
      if (!checklistId) return [];

      const { data, error } = await supabase
        .from("checklist_groups")
        .select("*")
        .eq("checklist_id", checklistId)
        .order("order", { ascending: true });

      if (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }

      const typedGroups = data.map(group => ({
        id: group.id,
        title: group.title,
        order: group.order,
      })) as ChecklistGroup[];

      setGroups(typedGroups);
      return typedGroups;
    },
    enabled: !!checklistId,
  });

  const updateChecklistMutation = useMutation({
    mutationFn: async (updates: Partial<Checklist>) => {
      if (!checklistId) throw new Error("Checklist ID is required for updates.");

      const { data, error } = await supabase
        .from("checklists")
        .update(updates)
        .eq("id", checklistId)
        .select()
        .single();

      if (error) {
        console.error("Error updating checklist:", error);
        throw new Error(`Failed to update checklist: ${error.message}`);
      }

      // Garantir tipagem correta no retorno também
      const validOrigin: 'manual' | 'ia' | 'csv' = (['manual', 'ia', 'csv'] as const).includes(data.origin as any) 
        ? (data.origin as 'manual' | 'ia' | 'csv')
        : 'manual';

      const typedData: Checklist = {
        id: data.id,
        title: data.title,
        description: data.description,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status,
        status_checklist: data.status_checklist,
        is_template: data.is_template,
        user_id: data.user_id,
        company_id: data.company_id,
        responsible_id: data.responsible_id,
        category: data.category,
        origin: validOrigin,
        questions: undefined, // Será carregado separadamente
        groups: undefined, // Será carregado separadamente
        responsibleName: undefined // Poderia ser carregado com JOIN se necessário
      };

      return typedData;
    },
    onSuccess: (data) => {
      toast.success("Checklist atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["checklist", checklistId] });
      setChecklistData(data);
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar checklist: ${error.message || "Unknown error"}`);
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (question: ChecklistQuestion) => {
      const { data, error } = await supabase
        .from("checklist_itens")
        .update({
          pergunta: question.text,
          tipo_resposta: frontendToDatabaseResponseType(question.responseType),
          obrigatorio: question.isRequired,
          ordem: question.order,
          opcoes: question.options,
          weight: question.weight,
          permite_foto: question.allowsPhoto,
          permite_video: question.allowsVideo,
          permite_audio: question.allowsAudio,
          permite_files: question.allowsFiles,
          parent_item_id: question.parentQuestionId,
          condition_value: question.conditionValue,
          hint: question.hint,
          display_condition: question.displayCondition,
          is_conditional: question.isConditional,
          has_subchecklist: question.hasSubChecklist,
          sub_checklist_id: question.subChecklistId,
        })
        .eq("id", question.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating question:", error);
        throw new Error(`Failed to update question: ${error.message}`);
      }

      return data as ChecklistItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-questions", checklistId] });
      toast.success("Pergunta atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar pergunta: ${error.message || "Unknown error"}`);
    },
  });

  const addQuestion = useCallback((groupId: string) => {
    const newQuestion: ChecklistQuestion = {
      id: `new-${Date.now()}-${Math.random()}`,
      text: "",
      responseType: "yes_no",
      isRequired: true,
      weight: 1,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      allowsFiles: false,
      order: questions.length,
      groupId,
      level: 0,
      path: `new-${Date.now()}-${Math.random()}`,
      isConditional: false,
      options: []
    };

    setQuestions(prev => [...prev, newQuestion]);
    toast.success("Nova pergunta adicionada");
  }, [questions.length]);

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from("checklist_itens")
        .delete()
        .eq("id", questionId);

      if (error) {
        console.error("Error deleting question:", error);
        throw new Error(`Failed to delete question: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-questions", checklistId] });
      toast.success("Pergunta excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir pergunta: ${error.message || "Unknown error"}`);
    },
  });

  const addGroupMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!checklistId) throw new Error("Checklist ID is required to add a group.");

      const newGroup = {
        id: uuidv4(),
        checklist_id: checklistId,
        title: title,
        order: groups.length,
      };

      const { data, error } = await supabase
        .from("checklist_groups")
        .insert(newGroup)
        .select()
        .single();

      if (error) {
        console.error("Error adding group:", error);
        throw new Error(`Failed to add group: ${error.message}`);
      }

      return {
        id: data.id,
        title: data.title,
        order: data.order,
      } as ChecklistGroup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-groups", checklistId] });
      toast.success("Grupo adicionado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar grupo: ${error.message || "Unknown error"}`);
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async (group: ChecklistGroup) => {
      const { data, error } = await supabase
        .from("checklist_groups")
        .update({
          title: group.title,
          order: group.order,
        })
        .eq("id", group.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating group:", error);
        throw new Error(`Failed to update group: ${error.message}`);
      }

      return {
        id: data.id,
        title: data.title,
        order: data.order,
      } as ChecklistGroup;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-groups", checklistId] });
      toast.success("Grupo atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar grupo: ${error.message || "Unknown error"}`);
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from("checklist_groups")
        .delete()
        .eq("id", groupId);

      if (error) {
        console.error("Error deleting group:", error);
        throw new Error(`Failed to delete group: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-groups", checklistId] });
      toast.success("Grupo excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir grupo: ${error.message || "Unknown error"}`);
    },
  });

  return {
    checklist,
    questions,
    groups,
    checklistData,
    isChecklistLoading,
    isQuestionsLoading,
    isGroupsLoading,
    updateChecklist: updateChecklistMutation.mutate,
    updateQuestion: updateQuestionMutation.mutate,
    addQuestion: addQuestion,
    deleteQuestion: deleteQuestionMutation.mutate,
    addGroup: addGroupMutation.mutate,
    updateGroup: updateGroupMutation.mutate,
    deleteGroup: deleteGroupMutation.mutate,
    isUpdatingChecklist: updateChecklistMutation.isPending,
    isUpdatingQuestion: updateQuestionMutation.isPending,
    isAddingGroup: addGroupMutation.isPending,
    isUpdatingGroup: updateGroupMutation.isPending,
    isDeletingGroup: deleteGroupMutation.isPending,
  };
}
