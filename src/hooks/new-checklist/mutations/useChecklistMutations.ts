
import { useQueryClient } from "@tanstack/react-query";
import { useChecklistDeleteMutation } from "./useChecklistDeleteMutation";
import { useChecklistStatusMutation, useChecklistBulkStatusMutation } from "./useChecklistStatusMutation";

/**
 * Composition hook that combines all checklist mutations
 */
export function useChecklistMutations() {
  const queryClient = useQueryClient();
  
  // Get individual mutations
  const deleteChecklist = useChecklistDeleteMutation();
  const updateStatus = useChecklistStatusMutation();
  const updateBulkStatus = useChecklistBulkStatusMutation();

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
