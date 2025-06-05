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

      setChecklistData(data);
      return data as Checklist;
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
        groupId: item.group_id || "default",
        level: 0,
        path: item.id,
        isConditional: item.is_conditional || false,
        parentQuestionId: item.parent_item_id,
        conditionValue: item.condition_value,
        displayCondition: item.display_condition,
        hasSubChecklist: item.hasSubChecklist,
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

      return data as Checklist;
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
          group_id: question.groupId,
          hasSubChecklist: question.hasSubChecklist,
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
      options: [] // Adicionar a propriedade options que estava faltando
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

      const newGroup: ChecklistGroup = {
        id: uuidv4(),
        title: title,
        order: groups.length,
      };

      const { data, error } = await supabase
        .from("checklist_groups")
        .insert({
          id: newGroup.id,
          checklist_id: checklistId,
          title: newGroup.title,
          order: newGroup.order,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding group:", error);
        throw new Error(`Failed to add group: ${error.message}`);
      }

      return { ...newGroup, ...data } as ChecklistGroup;
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

      return data as ChecklistGroup;
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
    isUpdatingChecklist: updateChecklistMutation.isLoading,
    isUpdatingQuestion: updateQuestionMutation.isLoading,
    isAddingGroup: addGroupMutation.isLoading,
    isUpdatingGroup: updateGroupMutation.isLoading,
    isDeletingGroup: deleteGroupMutation.isLoading,
  };
}
