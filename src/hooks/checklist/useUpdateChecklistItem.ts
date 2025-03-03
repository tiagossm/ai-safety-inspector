
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistItem } from "@/types/checklist";

export function useUpdateChecklistItem() {
  return useMutation({
    mutationFn: async (item: ChecklistItem) => {
      // Prepare opcoes for storage - ensure it's compatible with JSON
      const opcoesFinal = item.opcoes ? item.opcoes : null;

      const { error } = await supabase
        .from("checklist_itens")
        .update({
          pergunta: item.pergunta,
          tipo_resposta: item.tipo_resposta,
          obrigatorio: item.obrigatorio,
          ordem: item.ordem,
          opcoes: opcoesFinal
        })
        .eq("id", item.id);

      if (error) throw error;
    },
    onError: (error) => {
      console.error("Erro ao atualizar item:", error);
      toast.error("Erro ao atualizar item do checklist");
    }
  });
}
