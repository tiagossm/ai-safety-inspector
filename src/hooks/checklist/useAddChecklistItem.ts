
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChecklistItem } from "@/types/checklist";

export function useAddChecklistItem(checklistId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newItem: Partial<ChecklistItem>) => {
      console.log("Adding new item to checklist:", checklistId, newItem);
      
      // Ensure the data is properly formatted
      const itemData = {
        checklist_id: checklistId,
        pergunta: newItem.pergunta,
        tipo_resposta: newItem.tipo_resposta || "sim/não",
        obrigatorio: newItem.obrigatorio !== undefined ? newItem.obrigatorio : true,
        ordem: newItem.ordem || 0,
        opcoes: newItem.opcoes,
        permite_foto: newItem.permite_foto !== undefined ? newItem.permite_foto : true,
        permite_audio: newItem.permite_audio !== undefined ? newItem.permite_audio : true,
        permite_video: newItem.permite_video !== undefined ? newItem.permite_video : true,
        condicao: newItem.condicao // Add support for conditional questions
      };
      
      const { data, error } = await supabase
        .from("checklist_itens")
        .insert(itemData)
        .select()
        .single();

      if (error) {
        console.error("Error adding checklist item:", error);
        throw error;
      }

      console.log("Successfully added checklist item:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-items", checklistId] });
      toast.success("Item adicionado com sucesso");
    },
    onError: (error) => {
      console.error("Error in useAddChecklistItem:", error);
      toast.error("Erro ao adicionar item ao checklist");
    }
  });
}
