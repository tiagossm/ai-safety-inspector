
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { offlineSupabase } from "@/services/offlineSupabase";

// Use simple type aliases to avoid excessive type instantiation
type SupabaseResponse = { error: any | null };
type DeleteResult = { success: boolean };

// Define standalone functions to avoid nesting
async function deleteUserChecklists(id: string): Promise<void> {
  const client = navigator.onLine ? supabase : offlineSupabase;
  try {
    const { error } = await client
      .from("user_checklists")
      .delete()
      .eq("checklist_id", id);

    if (error) {
      console.error("Error deleting user_checklists:", error);
    }
  } catch (error) {
    console.error("Exception when deleting user_checklists:", error);
  }
}

async function deleteChecklistItems(id: string): Promise<void> {
  const client = navigator.onLine ? supabase : offlineSupabase;
  try {
    const { error } = await client
      .from("checklist_itens")
      .delete()
      .eq("checklist_id", id);

    if (error) {
      console.error("Error deleting checklist items:", error);
    }
  } catch (error) {
    console.error("Exception when deleting checklist items:", error);
  }
}

async function deleteChecklist(id: string): Promise<DeleteResult> {
  const client = navigator.onLine ? supabase : offlineSupabase;
  try {
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

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation<DeleteResult, Error, string>({
    mutationFn: async (id: string): Promise<DeleteResult> => {
      console.log("Starting deletion of checklist:", id);
      
      // First, delete any user_checklists associations to prevent foreign key errors
      await deleteUserChecklists(id);

      // Next, delete any checklist items to prevent foreign key errors
      await deleteChecklistItems(id);
      
      // Finally, delete the checklist itself
      return await deleteChecklist(id);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["user-checklists"] });
      
      toast.success("Checklist excluído com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Error in delete checklist mutation:", error);
      toast.error("Erro ao excluir checklist", {
        description: error?.message || "Tente novamente mais tarde"
      });
    }
  });
}
