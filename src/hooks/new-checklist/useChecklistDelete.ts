
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
      
      // If there are related inspections, ask the user for confirmation or delete them first
      if (inspectionsData && inspectionsData.length > 0) {
        console.log(`Found ${inspectionsData.length} inspections related to this checklist`);
        
        // Delete all inspections related to this checklist
        const { error: inspectionResponsesError } = await supabase
          .from("inspection_responses")
          .delete()
          .in("inspection_id", inspectionsData.map(i => i.id));
          
        if (inspectionResponsesError) {
          console.error("Error deleting inspection responses:", inspectionResponsesError);
          // Continue even if there's an error here
        }
        
        const { error: inspectionsDeleteError } = await supabase
          .from("inspections")
          .delete()
          .eq("checklist_id", checklistId);
          
        if (inspectionsDeleteError) {
          console.error("Error deleting related inspections:", inspectionsDeleteError);
          throw inspectionsDeleteError;
        }
      }
      
      // Now delete all items (questions) associated with the checklist
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
