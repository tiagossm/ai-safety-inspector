
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";
import { frontendToDatabaseResponseType } from "@/utils/responseTypeMap";

interface ChecklistUpdateParams extends Partial<ChecklistWithStats> {
  id: string;
  questions?: ChecklistQuestion[];
  groups?: ChecklistGroup[];
  deletedQuestionIds?: string[];
  is_template?: boolean;
  status_checklist?: string;
}

export function useChecklistUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ChecklistUpdateParams) => {
      const { id, questions, groups, deletedQuestionIds, ...updateData } = params;

      const formattedUpdateData = {
        ...updateData,
        is_template:
          typeof params.is_template !== "undefined"
            ? params.is_template
            : typeof updateData.isTemplate !== "undefined"
            ? updateData.isTemplate
            : undefined,
        status_checklist:
          params.status_checklist ||
          (params.status === "active" || updateData.status === "active")
            ? "ativo"
            : (params.status === "inactive" || updateData.status === "inactive")
            ? "inativo"
            : "ativo",
        updated_at: new Date().toISOString()
      };

      delete formattedUpdateData.isTemplate;
      delete formattedUpdateData.status;

      const { data, error } = await supabase
        .from("checklists")
        .update(formattedUpdateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar checklist:", error);
        throw new Error(`Falha ao atualizar dados básicos: ${error.message}`);
      }

      if (questions && questions.length > 0) {
        const newQuestions = questions.filter((q) => q.id.startsWith("new-"));
        const existingQuestions = questions.filter((q) => !q.id.startsWith("new-"));

        if (newQuestions.length > 0) {
          const questionsToInsert = newQuestions.map((q, index) => {
            let hint = q.hint || "";
            if (typeof hint === "string" && hint.includes("{") && hint.includes("}")) {
              try {
                const parsed = JSON.parse(hint);
                if (parsed && (parsed.groupId || parsed.groupTitle || parsed.groupIndex)) {
                  hint = "";
                }
              } catch (e) {}
            }

            const options = Array.isArray(q.options) ? q.options.map((opt) => String(opt)) : [];
            const dbResponseType = frontendToDatabaseResponseType(q.responseType);

            return {
              checklist_id: id,
              pergunta: q.text,
              tipo_resposta: dbResponseType,
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
              hint: hint
            };
          });

          const { error: insertError } = await supabase
            .from("checklist_itens")
            .insert(questionsToInsert);

          if (insertError) {
            console.error("Erro ao inserir novas perguntas:", insertError);
            throw new Error(`Falha ao inserir novas perguntas: ${insertError.message}`);
          }
        }

        for (const question of existingQuestions) {
          let hint = question.hint || "";
          if (typeof hint === "string" && hint.includes("{") && hint.includes("}")) {
            try {
              const parsed = JSON.parse(hint);
              if (parsed && (parsed.groupId || parsed.groupTitle || parsed.groupIndex)) {
                hint = "";
              }
            } catch (e) {}
          }

          const options = Array.isArray(question.options)
            ? question.options.map((opt) => String(opt))
            : [];
            
          const dbResponseType = frontendToDatabaseResponseType(question.responseType);

          const { error: updateError } = await supabase
            .from("checklist_itens")
            .update({
              pergunta: question.text,
              tipo_resposta: dbResponseType,
              obrigatorio: question.isRequired,
              ordem: question.order,
              opcoes: options,
              weight: question.weight || 1,
              permite_foto: question.allowsPhoto,
              permite_video: question.allowsVideo,
              permite_audio: question.allowsAudio,
              permite_files: question.allowsFiles || false,
              parent_item_id: question.parentQuestionId,
              condition_value: question.conditionValue,
              hint: hint,
              updated_at: new Date().toISOString()
            })
            .eq("id", question.id);

          if (updateError) {
            console.error(`Erro ao atualizar pergunta ${question.id}:`, updateError);
            throw new Error(`Falha ao atualizar pergunta: ${updateError.message}`);
          }
        }
      }

      if (deletedQuestionIds && deletedQuestionIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("checklist_itens")
          .delete()
          .in("id", deletedQuestionIds);

        if (deleteError) {
          console.error("Erro ao excluir perguntas:", deleteError);
          throw new Error(`Falha ao excluir perguntas: ${deleteError.message}`);
        }
      }

      console.log("Checklist atualizado com sucesso:", data);
      return data;
    },

    onSuccess: (data) => {
      toast.success("Checklist atualizado com sucesso", { duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklists", data?.id] });
    },

    onError: (error: any) => {
      console.error("Erro na mutação:", error);
      toast.error(`Erro ao atualizar checklist: ${error.message || "Erro desconhecido"}`, {
        duration: 5000
      });
    }
  });
}
