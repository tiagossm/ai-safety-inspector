
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { offlineSupabase } from "@/services/offlineSupabase";

// Define async deletion functions to avoid nested structures
async function deleteUserChecklists(id: string) {
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
}

async function deleteChecklistItems(id: string) {
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
}

async function deleteChecklist(id: string) {
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
}

// Define type for mutation function to avoid deep type instantiation
type DeleteChecklistFn = (id: string) => Promise<{ success: boolean }>;

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  
  const mutationFn: DeleteChecklistFn = async (id: string) => {
    console.log("Starting deletion of checklist:", id);
    
    // First, delete any user_checklists associations to prevent foreign key errors
    await deleteUserChecklists(id);

    // Next, delete any checklist items to prevent foreign key errors
    await deleteChecklistItems(id);
    
    // Finally, delete the checklist itself
    return await deleteChecklist(id);
  };
  
  return useMutation({
    mutationFn,
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
