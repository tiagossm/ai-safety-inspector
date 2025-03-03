
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistItem } from "@/types/checklist";

export function useAddChecklistItem(checklistId: string) {
  return useMutation({
    mutationFn: async (newItem: Partial<ChecklistItem>) => {
      // Prepare opcoes for storage - ensure it's compatible with JSON
      const opcoesFinal = newItem.opcoes ? newItem.opcoes : null;

      const { data, error } = await supabase
        .from("checklist_itens")
        .insert({
          checklist_id: checklistId,
          pergunta: newItem.pergunta,
          tipo_resposta: newItem.tipo_resposta,
          obrigatorio: newItem.obrigatorio,
          ordem: newItem.ordem,
          opcoes: opcoesFinal
        })
        .select();

      if (error) throw error;
      return data[0];
    },
    onError: (error) => {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item ao checklist");
    }
  });
}
