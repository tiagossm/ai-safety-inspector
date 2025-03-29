import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";

// Convert UI friendly type to database type
const getDatabaseType = (type: ChecklistQuestion['responseType']): string => {
  const typeMap: Record<string, string> = {
    'yes_no': 'sim/não',
    'multiple_choice': 'seleção múltipla',
    'text': 'texto',
    'numeric': 'numérico',
    'photo': 'foto',
    'signature': 'assinatura',
    'sim/não': 'sim/não',
    'seleção múltipla': 'seleção múltipla',
    'texto': 'texto',
    'numérico': 'numérico',
    'foto': 'foto',
    'assinatura': 'assinatura'
  };
  return typeMap[type] || 'texto';
};

// Get database status mapping
const getStatusChecklist = (status: string): string => {
  return status === 'active' ? 'ativo' : 'inativo';
};

const getDatabaseStatus = (status: string): string => {
  if (status === 'active') return 'pendente';
  if (status === 'inactive') return 'inativo';
  return status;
};

export function useChecklistUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      checklist,
      questions,
      groups,
      deletedQuestionIds = []
    }: {
      checklist: Checklist;
      questions?: ChecklistQuestion[];
      groups?: ChecklistGroup[];
      deletedQuestionIds?: string[];
    }) => {
      if (!checklist.id) {
        throw new Error("Checklist ID is required for updates");
      }

      const statusChecklist = getStatusChecklist(checklist.status);
      const databaseStatus = getDatabaseStatus(checklist.status);

      const { error: updateError } = await supabase
        .from("checklists")
        .update({
          title: checklist.title,
          description: checklist.description,
          is_template: checklist.isTemplate,
          status_checklist: statusChecklist,
          status: checklist.status, // <- Corrigido: campo status sendo atualizado também
          category: checklist.category,
          responsible_id: checklist.responsibleId,
          company_id: checklist.companyId,
          due_date: checklist.dueDate
        })
        .eq("id", checklist.id);

      if (updateError) {
        console.error("Error updating checklist:", updateError);
        throw updateError;
      }

      if (deletedQuestionIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("checklist_itens")
          .delete()
          .in("id", deletedQuestionIds);

        if (deleteError) {
          console.error("Error deleting questions:", deleteError);
          toast.warning("Algumas perguntas não puderam ser removidas.");
        }
      }

      if (questions && questions.length > 0) {
        for (const question of questions) {
          let questionHint = question.hint || "";

          if (question.groupId && groups) {
            const group = groups.find(g => g.id === question.groupId);
            if (group) {
              questionHint = JSON.stringify({
                groupId: group.id,
                groupTitle: group.title,
                groupIndex: groups.indexOf(group)
              });
            }
          }

          const questionData = {
            checklist_id: checklist.id,
            pergunta: question.text,
            tipo_resposta: getDatabaseType(question.responseType),
            obrigatorio: question.isRequired,
            opcoes: question.options,
            hint: questionHint,
            weight: question.weight || 1,
            parent_item_id: question.parentQuestionId,
            condition_value: question.conditionValue,
            permite_foto: question.allowsPhoto || false,
            permite_video: question.allowsVideo || false,
            permite_audio: question.allowsAudio || false,
            ordem: question.order
          };

          if (question.id && question.id.startsWith("new-")) {
            const { error: insertError } = await supabase
              .from("checklist_itens")
              .insert(questionData);

            if (insertError) {
              console.error("Error inserting new question:", insertError);
              toast.warning(`Erro ao adicionar pergunta: "${question.text}"`);
            }
          } else if (question.id) {
            const { error: updateQuestionError } = await supabase
              .from("checklist_itens")
              .update(questionData)
              .eq("id", question.id);

            if (updateQuestionError) {
              console.error("Error updating question:", updateQuestionError);
              toast.warning(`Erro ao atualizar pergunta: "${question.text}"`);
            }
          }
        }
      }

      return { id: checklist.id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["new-checklist", result.id] });
      toast.success("Checklist atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error in useChecklistUpdate:", error);
      toast.error(`Erro ao atualizar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  });
}
