import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  deleteChecklistById, 
  updateChecklistStatus,
  updateBulkChecklistStatus,
  deleteBulkChecklistsById
} from "@/services/checklist/checklistMutationService";
import { toast } from "sonner";
import { handleApiError } from "@/utils/errorHandling";

/**
 * Hook para mutações de checklist (exclusão, atualização)
 * Usa o sistema centralizado de tratamento de erros
 */
export function useChecklistMutations() {
  const queryClient = useQueryClient();

  /**
   * Mutação para excluir um checklist
   */
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
        handleApiError(error, "Erro ao excluir checklist");
        throw error;
      }
    },
    onSuccess: () => {
      // Invalida as consultas para forçar uma nova busca
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-new-checklists"] });
    }
  });
  
  /**
   * Mutação para atualizar o status de um checklist
   */
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
        handleApiError(error, "Erro ao atualizar status");
        throw error;
      }
    },
    onSuccess: () => {
      // Invalida as consultas para forçar uma nova busca
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-new-checklists"] });
    }
  });

  /**
   * Mutação para atualizar o status de múltiplos checklists
   */
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
        handleApiError(error, "Erro ao atualizar status em massa");
        throw error;
      }
    },
    onSuccess: () => {
      // Invalida as consultas para forçar uma nova busca
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-new-checklists"] });
    }
  });

  /**
   * Mutação para excluir múltiplos checklists
   */
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
        handleApiError(error, "Erro ao excluir checklists em massa");
        throw error;
      }
    },
    onSuccess: () => {
      // Invalida as consultas para forçar uma nova busca
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-new-checklists"] });
    }
  });

  /**
   * Função para forçar atualização dos dados
   */
  const refetch = async () => {
    const toastId = toast.loading("Atualizando dados...");
    try {
      // Invalida as consultas para forçar uma nova busca
      await queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      await queryClient.invalidateQueries({ queryKey: ["all-new-checklists"] });
      toast.dismiss(toastId);
      toast.success("Dados atualizados");
    } catch (error) {
      toast.dismiss(toastId);
      handleApiError(error, "Erro ao atualizar dados");
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
