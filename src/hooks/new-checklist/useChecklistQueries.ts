
import { useQuery } from "@tanstack/react-query";
import { 
  fetchChecklists, 
  fetchAllChecklistsData 
} from "@/services/checklist/checklistService";

export function useChecklistQueries(
  filterType: string, 
  selectedCompanyId: string, 
  selectedCategory: string, 
  selectedOrigin: string, 
  sortOrder: string
) {
  // Fetch checklists
  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ["new-checklists", filterType, selectedCompanyId, selectedCategory, selectedOrigin, sortOrder],
    queryFn: async () => {
      return fetchChecklists(filterType, selectedCompanyId, selectedCategory, sortOrder);
    }
  });

  // Fetch all checklist data only once for filtering
  const { data: allChecklists = [] } = useQuery({
    queryKey: ["all-checklists-data"],
    queryFn: async () => {
      return fetchAllChecklistsData();
    }
  });

  return {
    checklists,
    allChecklists,
    isLoading
  };
}
