
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteChecklistById } from "@/services/checklist/checklistService";

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

  // Refetch function
  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
    await queryClient.invalidateQueries({ queryKey: ["all-checklists-data"] });
  };

  return {
    deleteChecklist,
    refetch
  };
}
