
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client"; 
import { toast } from "sonner";

/**
 * Hook for updating a checklist's status
 */
export function useChecklistStatusMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ checklistId, newStatus }: { checklistId: string, newStatus: 'active' | 'inactive' }) => {
      const { error } = await supabase
        .from('checklists')
        .update({ status: newStatus })
        .eq('id', checklistId);
      
      if (error) throw error;
      return { id: checklistId, status: newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      toast.success("Status do checklist atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  });
}

/**
 * Hook for updating multiple checklists' statuses
 */
export function useChecklistBulkStatusMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ checklistIds, newStatus }: { checklistIds: string[], newStatus: 'active' | 'inactive' }) => {
      const { error } = await supabase
        .from('checklists')
        .update({ status: newStatus })
        .in('id', checklistIds);
      
      if (error) throw error;
      return { ids: checklistIds, status: newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      toast.success("Status dos checklists atualizados com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  });
}
