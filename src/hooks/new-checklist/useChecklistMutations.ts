
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  deleteChecklistById, 
  updateChecklistStatus,
  updateBulkChecklistStatus
} from "@/services/checklist/checklistMutationService";

/**
 * Hook for checklist mutations (delete, update)
 */
export function useChecklistMutations() {
  const queryClient = useQueryClient();

  // Delete checklist mutation
  const deleteChecklist = useMutation({
    mutationFn: async (checklistId: string) => {
      return deleteChecklistById(checklistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
    }
  });
  
  // Update checklist status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ checklistId, newStatus }: { checklistId: string, newStatus: 'active' | 'inactive' }) => {
      return updateChecklistStatus(checklistId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
    }
  });

  // Update multiple checklists status mutation
  const updateBulkStatus = useMutation({
    mutationFn: async ({ checklistIds, newStatus }: { checklistIds: string[], newStatus: 'active' | 'inactive' }) => {
      return updateBulkChecklistStatus(checklistIds, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
    }
  });

  // Refetch function
  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
    await queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
  };

  return {
    deleteChecklist,
    updateStatus,
    updateBulkStatus,
    refetch
  };
}
