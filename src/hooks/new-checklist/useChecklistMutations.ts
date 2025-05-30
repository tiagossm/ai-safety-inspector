
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  deleteChecklistById, 
  updateChecklistStatus,
  updateBulkChecklistStatus,
  deleteBulkChecklistsById
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
      const toastId = toast.loading("Excluindo checklist...");
      try {
        const result = await deleteChecklistById(checklistId);
        toast.dismiss(toastId);
        toast.success("Checklist excluído com sucesso");
        return result;
      } catch (error) {
        toast.dismiss(toastId);
        console.error("Error deleting checklist:", error);
        toast.error(`Erro ao excluir checklist: ${error.message || "Falha na operação"}`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
    }
  });
  
  // Update checklist status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ checklistId, newStatus }: { checklistId: string, newStatus: 'active' | 'inactive' }) => {
      const toastId = toast.loading("Atualizando status...");
      try {
        const result = await updateChecklistStatus(checklistId, newStatus);
        toast.dismiss(toastId);
        toast.success(`Status alterado para ${newStatus === 'active' ? 'ativo' : 'inativo'}`);
        return result;
      } catch (error) {
        toast.dismiss(toastId);
        console.error("Error updating checklist status:", error);
        toast.error(`Erro ao atualizar status: ${error.message || "Falha na operação"}`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
    }
  });

  // Update multiple checklists status mutation
  const updateBulkStatus = useMutation({
    mutationFn: async ({ checklistIds, newStatus }: { checklistIds: string[], newStatus: 'active' | 'inactive' }) => {
      if (checklistIds.length === 0) {
        toast.warning("Nenhum checklist selecionado");
        return { success: false };
      }
      
      const toastId = toast.loading(`Atualizando status de ${checklistIds.length} checklists...`);
      try {
        const result = await updateBulkChecklistStatus(checklistIds, newStatus);
        toast.dismiss(toastId);
        toast.success(`Status de ${checklistIds.length} checklists alterado para ${newStatus === 'active' ? 'ativo' : 'inativo'}`);
        return result;
      } catch (error) {
        toast.dismiss(toastId);
        console.error("Error updating multiple checklists status:", error);
        toast.error(`Erro ao atualizar status em massa: ${error.message || "Falha na operação"}`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
    }
  });

  // Bulk delete mutation
  const deleteBulkChecklists = useMutation({
    mutationFn: async (checklistIds: string[]): Promise<{ success: boolean, count: number, failed?: number }> => {
      if (!checklistIds.length) return { success: true, count: 0 };
      
      const toastId = toast.loading(`Excluindo ${checklistIds.length} checklists...`);
      try {
        const result = await deleteBulkChecklistsById(checklistIds);
        toast.dismiss(toastId);
        if (result.failed && result.failed > 0) {
          toast.warning(`${result.count} checklists excluídos, ${result.failed} falhas`);
        } else {
          toast.success(`${result.count} checklists excluídos com sucesso`);
        }
        return result;
      } catch (error) {
        toast.dismiss(toastId);
        console.error("Error in bulk delete operation:", error);
        toast.error(`Erro ao excluir checklists: ${error.message || "Falha na operação"}`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
    }
  });

  // Refetch function with loading toast
  const refetch = async () => {
    const toastId = toast.loading("Atualizando dados...");
    try {
      await queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      await queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
      toast.dismiss(toastId);
      toast.success("Dados atualizados");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Erro ao atualizar dados");
    }
  };

  return {
    deleteChecklist,
    updateStatus,
    updateBulkStatus,
    deleteBulkChecklists,
    refetch
  };
}
