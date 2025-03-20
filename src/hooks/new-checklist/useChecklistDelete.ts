
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useChecklistDelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (checklistId: string) => {
      console.log("Deleting checklist:", checklistId);
      
      // First delete all items (questions) associated with the checklist
      const { error: itemsError } = await supabase
        .from("checklist_itens")
        .delete()
        .eq("checklist_id", checklistId);
        
      if (itemsError) {
        console.error("Error deleting checklist items:", itemsError);
        toast.warning("Alguns itens do checklist não puderam ser removidos.");
      }
      
      // Then delete the checklist itself
      const { error: checklistError } = await supabase
        .from("checklists")
        .delete()
        .eq("id", checklistId);
        
      if (checklistError) {
        console.error("Error deleting checklist:", checklistError);
        throw checklistError;
      }
      
      return { id: checklistId };
    },
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      toast.success("Checklist excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Error in useChecklistDelete:", error);
      toast.error(`Erro ao excluir checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  });
}
