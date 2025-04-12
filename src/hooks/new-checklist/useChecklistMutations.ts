import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  deleteChecklistById, 
  updateChecklistStatus,
  updateBulkChecklistStatus
} from "@/services/checklist/checklistMutationService";
import { toast } from "sonner";

/**
 * Hook for checklist mutations (delete, update)
 */
export function useChecklistMutations() {
  const queryClient = useQueryClient();

  // Delete checklist mutation
  const deleteChecklist = useMutation({
    mutationFn: async (checklistId: string) => {
      toast.loading("Excluindo checklist...");
      try {
        const startTime = performance.now();
        const result = await deleteChecklistById(checklistId);
        const endTime = performance.now();
        console.log(`Deletion took ${endTime - startTime}ms for checklist ${checklistId}`);
        toast.dismiss();
        return result;
      } catch (error) {
        toast.dismiss();
        console.error("Error deleting checklist:", error);
        toast.error(`Erro ao excluir checklist: ${error.message || "Falha na operação"}`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
      toast.success("Checklist excluído com sucesso");
    }
  });
  
  // Update checklist status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ checklistId, newStatus }: { checklistId: string, newStatus: 'active' | 'inactive' }) => {
      try {
        return await updateChecklistStatus(checklistId, newStatus);
      } catch (error) {
        console.error("Error updating checklist status:", error);
        toast.error(`Erro ao atualizar status: ${error.message || "Falha na operação"}`);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
      toast.success(`Status alterado para ${variables.newStatus === 'active' ? 'ativo' : 'inativo'}`);
    }
  });

  // Update multiple checklists status mutation
  const updateBulkStatus = useMutation({
    mutationFn: async ({ checklistIds, newStatus }: { checklistIds: string[], newStatus: 'active' | 'inactive' }) => {
      try {
        return await updateBulkChecklistStatus(checklistIds, newStatus);
      } catch (error) {
        console.error("Error updating multiple checklists status:", error);
        toast.error(`Erro ao atualizar status em massa: ${error.message || "Falha na operação"}`);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
      toast.success(`Status de ${variables.checklistIds.length} checklists alterado para ${variables.newStatus === 'active' ? 'ativo' : 'inativo'}`);
    }
  });

  // Bulk delete mutation
  const deleteBulkChecklists = useMutation({
    mutationFn: async (checklistIds: string[]) => {
      if (!checklistIds.length) return { success: true, count: 0 };
      
      toast.loading(`Excluindo ${checklistIds.length} checklists...`);
      try {
        let successCount = 0;
        let failCount = 0;
        
        // Process each deletion sequentially to avoid overwhelming the server
        for (const id of checklistIds) {
          try {
            await deleteChecklistById(id);
            successCount++;
          } catch (err) {
            console.error(`Failed to delete checklist ${id}:`, err);
            failCount++;
          }
        }
        
        toast.dismiss();
        return { 
          success: true, 
          count: successCount, 
          failed: failCount 
        };
      } catch (error) {
        toast.dismiss();
        console.error("Error in bulk delete operation:", error);
        toast.error(`Erro ao excluir checklists: ${error.message || "Falha na operação"}`);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
      
      if (result.failed) {
        toast.warning(`${result.count} checklists excluídos, ${result.failed} falhas`);
      } else {
        toast.success(`${result.count} checklists excluídos com sucesso`);
      }
    }
  });

  // Refetch function with loading toast
  const refetch = async () => {
    toast.loading("Atualizando dados...");
    await queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
    await queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
    toast.dismiss();
    toast.success("Dados atualizados");
  };

  return {
    deleteChecklist,
    updateStatus,
    updateBulkStatus,
    deleteBulkChecklists,
    refetch
  };
}
