import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";
import { frontendToDatabaseResponseType } from "@/utils/responseTypeMap";

interface ChecklistCreateParams extends NewChecklistPayload {
  questions?: ChecklistQuestion[];
  groups?: ChecklistGroup[];
}

export function useChecklistCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ChecklistCreateParams) => {
      const { questions, groups, ...checklistData } = params;

      // Create the checklist first
      const { data: checklist, error: checklistError } = await supabase
        .from("checklists")
        .insert({
          title: checklistData.title,
          description: checklistData.description,
          is_template: checklistData.is_template || false,
          status_checklist: checklistData.status_checklist || "ativo",
          category: checklistData.category,
          company_id: checklistData.company_id,
          responsible_id: checklistData.responsible_id,
          origin: checklistData.origin || "manual",
          due_date: checklistData.due_date,
        })
        .select()
        .single();

      if (checklistError) {
        console.error("Erro ao criar checklist:", checklistError);
        throw new Error(`Falha ao criar checklist: ${checklistError.message}`);
      }

      // Insert questions if provided
      if (questions && questions.length > 0) {
        const questionsToInsert = questions.map((q, index) => {
          // Handle hint that might contain group metadata
          let hint = q.hint || "";
          if (typeof hint === "string" && hint.includes("{") && hint.includes("}")) {
            try {
              const parsed = JSON.parse(hint);
              if (parsed && (parsed.groupId || parsed.groupTitle || parsed.groupIndex)) {
                hint = ""; // Clear metadata hints
              }
            } catch (e) {
              // If parsing fails, keep the original hint
            }
          }

          const options = Array.isArray(q.options) ? q.options.map(opt => String(opt)) : [];

          return {
            checklist_id: checklist.id,
            pergunta: q.text,
            tipo_resposta: frontendToDatabaseResponseType(q.responseType),
            obrigatorio: q.isRequired,
            ordem: q.order || index,
            opcoes: options,
            weight: q.weight || 1,
            permite_foto: q.allowsPhoto,
            permite_video: q.allowsVideo,
            permite_audio: q.allowsAudio,
            permite_files: q.allowsFiles || false,
            parent_item_id: q.parentQuestionId,
            condition_value: q.conditionValue,
            hint: hint,
            display_condition: q.displayCondition,
            is_conditional: q.isConditional || false
          };
        });

        const { error: questionsError } = await supabase
          .from("checklist_itens")
          .insert(questionsToInsert);

        if (questionsError) {
          console.error("Erro ao inserir perguntas:", questionsError);
          throw new Error(`Falha ao inserir perguntas: ${questionsError.message}`);
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
