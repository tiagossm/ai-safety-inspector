
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { offlineSupabase } from "@/services/offlineSupabase";

// Define a simple result type to avoid deep type nesting
type DeleteResult = { success: boolean; message?: string };

// Define a custom response type to handle both online and offline responses
interface OperationResponse {
  error: Error | null;
  data?: any;
}

// Simplified standalone functions to avoid deep type nesting
async function deleteUserChecklists(id: string): Promise<void> {
  const client = navigator.onLine ? supabase : offlineSupabase;
  try {
    const result = await client
      .from("user_checklists")
      .delete()
      .eq("checklist_id", id);
      
    // Check for errors in the response
    const response = result as unknown as OperationResponse;
    if (response.error) {
      console.error("Error deleting user_checklists:", response.error);
    }
  } catch (error) {
    console.error("Exception when deleting user_checklists:", error);
  }
}

async function deleteChecklistItems(id: string): Promise<void> {
  const client = navigator.onLine ? supabase : offlineSupabase;
  try {
    const result = await client
      .from("checklist_itens")
      .delete()
      .eq("checklist_id", id);
      
    // Check for errors in the response
    const response = result as unknown as OperationResponse;
    if (response.error) {
      console.error("Error deleting checklist items:", response.error);
    }
  } catch (error) {
    console.error("Exception when deleting checklist items:", error);
  }
}

async function deleteChecklist(id: string): Promise<DeleteResult> {
  const client = navigator.onLine ? supabase : offlineSupabase;
  try {
    const result = await client
      .from("checklists")
      .delete()
      .eq("id", id);
      
    // Check for errors in the response
    const response = result as unknown as OperationResponse;
    if (response.error) {
      throw response.error;
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
  
  return useMutation({
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
