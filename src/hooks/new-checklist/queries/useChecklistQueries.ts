import { useQuery } from "@tanstack/react-query";
import { fetchChecklists, fetchChecklistById } from "@/services/checklist/checklistService";

export const useChecklistsQuery = (params: any = {}) => {
  return useQuery({
    queryKey: ["checklists", params],
    queryFn: () => fetchChecklists(params)
  });
};

export const useChecklistQuery = (id: string) => {
  return useQuery({
    queryKey: ["checklist", id],
    queryFn: () => fetchChecklistById(id),
    enabled: !!id
  });
};
