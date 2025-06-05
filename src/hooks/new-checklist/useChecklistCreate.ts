
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";
import { frontendToDatabaseResponseType } from "@/utils/responseTypeMap";

interface CreateChecklistParams extends NewChecklistPayload {
  questions: ChecklistQuestion[];
  groups: ChecklistGroup[];
}

export function useChecklistCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateChecklistParams) => {
      const { questions, groups, ...checklistData } = params;

      // Criar o checklist
      const { data: checklist, error: checklistError } = await supabase
        .from("checklists")
        .insert({
          ...checklistData,
          is_template: checklistData.is_template || false,
          status_checklist: checklistData.status_checklist || "ativo",
          status: checklistData.status || "active"
        })
        .select()
        .single();

      if (checklistError || !checklist) {
        console.error("Erro ao criar checklist:", checklistError);
        throw new Error(`Falha ao criar checklist: ${checklistError?.message || "Erro desconhecido"}`);
      }

      // Criar grupos se existirem
      if (groups && groups.length > 0) {
        const groupsToInsert = groups.map(group => ({
          id: group.id,
          checklist_id: checklist.id,
          title: group.title,
          order: group.order
        }));

        const { error: groupsError } = await supabase
          .from("checklist_groups")
          .insert(groupsToInsert);

        if (groupsError) {
          console.error("Erro ao criar grupos:", groupsError);
          throw new Error(`Falha ao criar grupos: ${groupsError.message}`);
        }
      }

      // Criar perguntas se existirem
      if (questions && questions.length > 0) {
        const questionsToInsert = questions.map((question) => {
          // Converter DisplayCondition para JSON compatível removendo propriedades não compatíveis
          const displayCondition = question.displayCondition ? {
            parentQuestionId: question.displayCondition.parentQuestionId,
            expectedValue: question.displayCondition.expectedValue,
            operator: question.displayCondition.operator,
            rules: question.displayCondition.rules,
            logic: question.displayCondition.logic
          } : null;

          return {
            checklist_id: checklist.id,
            pergunta: question.text,
            tipo_resposta: frontendToDatabaseResponseType(question.responseType),
            obrigatorio: question.isRequired,
            ordem: question.order,
            opcoes: question.options,
            weight: question.weight || 1,
            permite_foto: question.allowsPhoto,
            permite_video: question.allowsVideo,
            permite_audio: question.allowsAudio,
            permite_files: question.allowsFiles || false,
            parent_item_id: question.parentQuestionId,
            condition_value: question.conditionValue,
            hint: question.hint,
            display_condition: displayCondition,
            is_conditional: question.isConditional || false,
            has_subchecklist: question.hasSubChecklist || false,
            sub_checklist_id: question.subChecklistId
          };
        });

        const { error: questionsError } = await supabase
          .from("checklist_itens")
          .insert(questionsToInsert);

        if (questionsError) {
          console.error("Erro ao criar perguntas:", questionsError);
          throw new Error(`Falha ao criar perguntas: ${questionsError.message}`);
        }
      }

      console.log("Checklist criado com sucesso:", checklist);
      return checklist;
    },

    onSuccess: (data) => {
      toast.success("Checklist criado com sucesso", { duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
    },

    onError: (error: any) => {
      console.error("Erro na mutação:", error);
      toast.error(`Erro ao criar checklist: ${error.message || "Erro desconhecido"}`, {
        duration: 5000
      });
    }
  });
}
