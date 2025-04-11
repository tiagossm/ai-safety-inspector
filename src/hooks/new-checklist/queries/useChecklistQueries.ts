
import { useQuery } from "@tanstack/react-query";
import { fetchChecklists, fetchChecklistById } from "@/services/checklist/checklistService";
import { transformChecklistsStats, transformChecklists } from "@/services/checklist/checklistTransformers";

export const useChecklistQuery = (id?: string) => {
  return useQuery({
    queryKey: ["checklist", id],
    queryFn: () => {
      if (!id) throw new Error("Checklist ID is required");
      return fetchChecklistById(id);
    },
    enabled: !!id
  });
};

export const useChecklistsQuery = (page: number = 1, pageSize: number = 10, search: string = "", isTemplate?: boolean) => {
  return useQuery({
    queryKey: ["checklists", page, pageSize, search, isTemplate],
    queryFn: async () => {
      const data = await fetchChecklists();
      return {
        data: transformChecklists(data || []),
        total: data?.length || 0,
      };
    }
  });
};
