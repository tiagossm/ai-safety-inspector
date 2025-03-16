
import { useQuery } from "@tanstack/react-query";

interface ChecklistPermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export function useChecklistPermissions(checklistId: string) {
  return useQuery<ChecklistPermissions>({
    queryKey: ["checklist-permissions", checklistId],
    queryFn: async () => {
      // Return full permissions for all checklists
      return {
        read: true,
        write: true,
        delete: true
      };
    },
    enabled: !!checklistId,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });
}
