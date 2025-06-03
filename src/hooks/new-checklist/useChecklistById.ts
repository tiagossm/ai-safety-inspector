
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { databaseToFrontendResponseType } from "@/utils/responseTypeMap";

const processChecklistItems = (items: any[]): ChecklistQuestion[] => {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    let options: string[] = [];
    try {
      if (typeof item.opcoes === 'string') {
        options = JSON.parse(item.opcoes);
      } else if (Array.isArray(item.opcoes)) {
        options = item.opcoes;
      } else if (typeof item.opcoes === 'object') {
        options = item.opcoes;
      }
    } catch (e) {
      console.warn(`Erro ao processar opções da pergunta ${item.id}:`, e);
    }

    return {
      id: item.id,
      text: item.pergunta,
      description: item.hint || "",
      responseType: databaseToFrontendResponseType(item.tipo_resposta),
      isRequired: item.obrigatorio !== false,
      order: item.ordem || index,
      groupId: item.group_id || "default",
      weight: item.weight || 1,
      allowsPhoto: item.permite_foto === true,
      allowsVideo: item.permite_video === true,
      allowsAudio: item.permite_audio === true,
      allowsFiles: item.permite_files === true,
      options,
      hint: item.hint || "",
      parentQuestionId: item.parent_item_id || undefined,
      conditionValue: item.condition_value || undefined,
      hasSubChecklist: item.has_subchecklist === true,
      subChecklistId: item.sub_checklist_id || undefined,
      level: item.level || 0,
      path: item.path || item.id,
      displayCondition: item.display_condition || undefined,
      isConditional: item.is_conditional || false
    };
  });
};

export function useChecklistById(id?: string) {
  return useQuery({
    queryKey: ["new-checklists", id],
    queryFn: async () => {
      if (!id) {
        return null;
      }

      const { data: checklist, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Erro ao buscar checklist: ${error.message}`);
      }

      if (!checklist) {
        return null;
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", id)
        .order("ordem", { ascending: true });

      if (questionsError) {
        throw new Error(`Erro ao buscar perguntas: ${questionsError.message}`);
      }

      const questions = processChecklistItems(questionsData);

      // Criar grupos padrão já que a tabela checklist_groups não existe
      const groups: ChecklistGroup[] = [{
        id: "default",
        title: "Geral",
        order: 0
      }];

      const checklistWithQuestions: ChecklistWithStats = {
        id: checklist.id,
        title: checklist.title,
        description: checklist.description,
        isTemplate: checklist.is_template || false,
        status: checklist.status || "active",
        category: checklist.category,
        responsibleId: checklist.responsible_id,
        companyId: checklist.company_id,
        userId: checklist.user_id,
        createdAt: checklist.created_at,
        updatedAt: checklist.updated_at,
        dueDate: checklist.due_date,
        isSubChecklist: checklist.is_sub_checklist || false,
        origin: checklist.origin || "manual",
        questions,
        groups,
        totalQuestions: questions.length
      };

      return checklistWithQuestions;
    },
    enabled: !!id
  });
}
