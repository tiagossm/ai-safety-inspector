import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist, ChecklistWithStats, ChecklistQuestion } from "@/types/newChecklist";

export const useChecklistById = (id: string) => {
  const [checklistData, setChecklistData] = useState<ChecklistWithStats | null>(null);
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);

  const { data: checklist, isLoading, error, refetch } = useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklists")
        .select(`
          *,
          checklist_itens(*),
          companies(fantasy_name),
          users!checklists_responsible_id_fkey(name)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching checklist:", error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (checklist) {
      const transformedChecklist: ChecklistWithStats = {
        id: checklist.id,
        title: checklist.title,
        description: checklist.description,
        isTemplate: checklist.is_template,
        is_template: checklist.is_template,
        status: checklist.status,
        category: checklist.category,
        responsibleId: checklist.responsible_id,
        companyId: checklist.company_id,
        userId: checklist.user_id,
        createdAt: checklist.created_at,
        updatedAt: checklist.updated_at,
        dueDate: checklist.due_date,
        isSubChecklist: checklist.is_sub_checklist,
        origin: checklist.origin,
        totalQuestions: checklist.checklist_itens?.length || 0,
        completedQuestions: 0,
        companyName: checklist.companies?.fantasy_name,
        responsibleName: checklist.users?.name,
        questions: checklist.checklist_itens || [],
        groups: checklist.groups || []
      };

      setChecklistData(transformedChecklist);

      // Format questions to ChecklistQuestion type
      const formattedQuestions: ChecklistQuestion[] = checklist.checklist_itens?.map((item) => ({
        id: item.id,
        text: item.pergunta,
        responseType: item.tipo_resposta,
        isRequired: item.obrigatorio,
        allowsPhoto: item.permite_foto,
        allowsVideo: item.permite_video,
        allowsAudio: item.permite_audio,
        options: item.opcoes,
        hint: item.hint,
        weight: item.weight,
        order: item.ordem,
        groupId: item.group_id,
        parentQuestionId: item.parent_item_id,
        subChecklistId: item.sub_checklist_id,
        hasSubChecklist: item.has_sub_checklist,
        parentId: item.parent_item_id,
        conditionValue: item.condition_value
      })) || [];

      setQuestions(formattedQuestions);
    }
  }, [checklist]);

  const transformedChecklist = checklistData ? {
    id: checklistData.id,
    title: checklistData.title,
    description: checklistData.description,
    isTemplate: checklistData.isTemplate,
    status: checklistData.status,
    category: checklistData.category,
    responsibleId: checklistData.responsibleId,
    companyId: checklistData.companyId,
    userId: checklistData.userId,
    createdAt: checklistData.createdAt,
    updatedAt: checklistData.updatedAt,
    dueDate: checklistData.dueDate,
    isSubChecklist: checklistData.isSubChecklist,
    origin: checklistData.origin,
    totalQuestions: checklistData.totalQuestions,
    completedQuestions: checklistData.completedQuestions,
    companyName: checklistData.companyName,
    responsibleName: checklistData.responsibleName,
  } : null;

  return {
    data: transformedChecklist ? {
      ...transformedChecklist,
      questions: questions,
      groups: checklist?.groups || []
    } : null,
    isLoading,
    error,
    refetch,
  };
};
