
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChecklistStatusMutation = () => {
  const queryClient = useQueryClient();
  
  const { mutateAsync } = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: "active" | "inactive" }) => {
      console.log(`Updating checklist ${id} status to ${status}`);
      
      const { data, error } = await supabase
        .from('checklists')
        .update({ status })
        .eq('id', id)
        .select('id, status');
      
      if (error) {
        console.error("Error updating checklist status:", error);
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
    },
    onError: (error) => {
      console.error("Error in status mutation:", error);
      toast.error("Falha ao atualizar status do checklist");
    }
  });
  
  // Return a simplified function that takes just the id and status
  return async (id: string, status: "active" | "inactive"): Promise<boolean> => {
    try {
      await mutateAsync({ id, status });
      return true;
    } catch (error) {
      console.error("Error updating status:", error);
      return false;
    }
  };
};

export const useChecklistBulkStatusMutation = () => {
  const queryClient = useQueryClient();
  
  const { mutateAsync } = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[], status: "active" | "inactive" }) => {
      console.log(`Updating ${ids.length} checklists to ${status}`);
      
      const { data, error } = await supabase
        .from('checklists')
        .update({ status })
        .in('id', ids)
        .select('id, status');
      
      if (error) {
        console.error("Error updating checklists status:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
    },
    onError: (error) => {
      console.error("Error in bulk status mutation:", error);
      toast.error("Falha ao atualizar status dos checklists");
    }
  });
  
  // Return a simplified function that takes just the ids and status
  return async (ids: string[], status: "active" | "inactive"): Promise<void> => {
    await mutateAsync({ ids, status });
  };
};
