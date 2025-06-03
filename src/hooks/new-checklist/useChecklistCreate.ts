
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";
import { normalizeResponseType } from "@/utils/inspection/normalizationUtils";

interface ChecklistCreateParams {
  checklist: NewChecklistPayload;
  questions: ChecklistQuestion[];
  groups: ChecklistGroup[];
}

export function useChecklistCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ checklist, questions, groups }: ChecklistCreateParams) => {
      console.log("Iniciando criação de checklist:", checklist);
      console.log("Perguntas a serem criadas:", questions.length);

      // Inserir checklist
      const checklistData = {
        title: checklist.title,
        description: checklist.description || "",
        category: checklist.category,
        is_template: checklist.is_template || false,
        status_checklist: checklist.status_checklist || "ativo",
        company_id: checklist.company_id || null,
        responsible_id: checklist.responsible_id || null,
        origin: checklist.origin || "manual"
      };

      const { data: newChecklist, error: checklistError } = await supabase
        .from("checklists")
        .insert(checklistData)
        .select()
        .single();

      if (checklistError) {
        console.error("Erro ao criar checklist:", checklistError);
        throw new Error(`Falha ao criar checklist: ${checklistError.message}`);
      }

      console.log("Checklist criado com ID:", newChecklist.id);

      // Inserir perguntas se existirem
      if (questions && questions.length > 0) {
        const questionsToInsert = questions.map((question, index) => {
          const dbResponseType = normalizeResponseType(
            question.responseType || ""
          );

          console.log(`Mapeando pergunta ${index}: ${question.responseType} -> ${dbResponseType}`);

          return {
            checklist_id: newChecklist.id,
            pergunta: question.text,
            tipo_resposta: dbResponseType,
            obrigatorio: question.isRequired !== false,
            ordem: question.order !== undefined ? question.order : index,
            opcoes: Array.isArray(question.options) ? question.options : null,
            weight: question.weight || 1,
            permite_foto: question.allowsPhoto || false,
            permite_video: question.allowsVideo || false,
            permite_audio: question.allowsAudio || false,
            permite_files: question.allowsFiles || false,
            parent_item_id: question.parentQuestionId || null,
            condition_value: question.conditionValue || null,
            hint: question.hint || null
          };
        });

        // Log para depuração dos tipos de resposta
        console.log(
          "Tipos de resposta para inserir:",
          questionsToInsert.map((q) => q.tipo_resposta)
        );

        const { error: questionsError } = await supabase
          .from("checklist_itens")
          .insert(questionsToInsert);

        if (questionsError) {
          console.error("Erro ao inserir perguntas:", questionsError);
          // Rollback: deletar o checklist criado
          await supabase.from("checklists").delete().eq("id", newChecklist.id);
          throw new Error(`Falha ao inserir perguntas: ${questionsError.message}`);
        }

        console.log(`${questionsToInsert.length} perguntas inseridas com sucesso`);
      }

      console.log("Checklist criado com sucesso!");
      return newChecklist;
    },

    onSuccess: (data) => {
      toast.success("Checklist criado com sucesso!", { duration: 5000 });
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    },

    onError: (error: any) => {
      console.error("Erro na criação do checklist:", error);
      toast.error(`Erro ao criar checklist: ${error.message || "Erro desconhecido"}`, {
        duration: 5000
      });
    }
  });
}
