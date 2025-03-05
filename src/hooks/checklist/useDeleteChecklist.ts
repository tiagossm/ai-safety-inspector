
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { offlineSupabase } from "@/services/offlineSupabase";

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log("Starting deletion of checklist:", id);
      
      // First, delete any user_checklists associations to prevent foreign key errors
      try {
        const { error: userChecklistsError } = await supabase
          .from("user_checklists")
          .delete()
          .eq("checklist_id", id);

        if (userChecklistsError) {
          console.error("Error deleting user_checklists:", userChecklistsError);
        }
      } catch (error) {
        console.error("Exception when deleting user_checklists:", error);
      }

      // Next, delete any checklist items to prevent foreign key errors
      try {
        const { error: itemsError } = await supabase
          .from("checklist_itens")
          .delete()
          .eq("checklist_id", id);

        if (itemsError) {
          console.error("Error deleting checklist items:", itemsError);
        }
      } catch (error) {
        console.error("Exception when deleting checklist items:", error);
      }
      
      // Finally, delete the checklist itself
      try {
        const client = navigator.onLine ? supabase : offlineSupabase;
        const { error } = await client
          .from("checklists")
          .delete()
          .eq("id", id);

        if (error) {
          throw error;
        }
        
        console.log("Checklist deleted successfully:", id);
        return { success: true };
      } catch (error) {
        console.error("Error deleting checklist:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["user-checklists"] });
      
      toast.success("Checklist excluído com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error in delete checklist mutation:", error);
      toast.error("Erro ao excluir checklist", {
        description: error?.message || "Tente novamente mais tarde"
      });
    }
  });
}
