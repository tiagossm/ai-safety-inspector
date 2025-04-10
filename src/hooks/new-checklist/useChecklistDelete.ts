
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useChecklistDelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (checklistId: string) => {
      console.log("Deleting checklist:", checklistId);
      
      // First check if there are any inspections associated with this checklist
      const { data: inspectionsData, error: inspectionsCheckError } = await supabase
        .from("inspections")
        .select("id")
        .eq("checklist_id", checklistId);
        
      if (inspectionsCheckError) {
        console.error("Error checking related inspections:", inspectionsCheckError);
        throw inspectionsCheckError;
      }
      
      // If there are related inspections, throw an error - can't delete directly
      if (inspectionsData && inspectionsData.length > 0) {
        console.log(`Found ${inspectionsData.length} inspections related to this checklist`);
        throw {
          code: "23503",
          message: "Checklist has related inspections",
          details: `This checklist has ${inspectionsData.length} related inspections`
        };
      }
      
      // Now delete all items (questions) associated with the checklist
      const { error: itemsError } = await supabase
        .from("checklist_itens")
        .delete()
        .eq("checklist_id", checklistId);
        
      if (itemsError) {
        console.error("Error deleting checklist items:", itemsError);
        
        // If this fails due to constraints, we should still try to report a helpful error
        if (itemsError.code === "23503") {
          throw itemsError;
        }
        
        // Otherwise just show a warning and continue
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
    onError: (error: any) => {
      console.error("Error in useChecklistDelete:", error);
      
      // Fornecer uma mensagem de erro mais amigável
      if (error.code === "23503" && error.message.includes("inspections")) {
        toast.error("Este checklist possui inspeções relacionadas e não pode ser excluído diretamente.");
      } else {
        toast.error(`Erro ao excluir checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      }
    }
  });
}
