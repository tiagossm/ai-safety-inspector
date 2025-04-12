
import { useQuery } from "@tanstack/react-query";
import { 
  fetchChecklists, 
  fetchAllChecklistsData 
} from "@/services/checklist/checklistQueryService";
import { handleApiError } from "@/utils/errors";

/**
 * Hook for querying checklists with filters
 */
export function useChecklistQueries(
  filterType: string, 
  selectedCompanyId: string, 
  selectedCategory: string,
  selectedOrigin: string,
  sortOrder: string
) {
  // Fetch checklists with applied filters
  const { 
    data: checklists = [], 
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ["new-checklists", filterType, selectedCompanyId, selectedCategory, selectedOrigin, sortOrder],
    queryFn: async () => {
      try {
        return await fetchChecklists(filterType, selectedCompanyId, selectedCategory, sortOrder);
      } catch (error) {
        handleApiError(error, "Erro ao carregar checklists");
        return [];
      }
    },
    staleTime: 60 * 1000, // 1 minute cache
  });

  // Fetch all checklist data only once for filtering
  const { 
    data: allChecklists = [],
    error: allChecklistsError
  } = useQuery({
    queryKey: ["all-checklists-data"],
    queryFn: async () => {
      try {
        return await fetchAllChecklistsData();
      } catch (error) {
        handleApiError(error, "Erro ao carregar dados de checklists");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  return {
    checklists,
    allChecklists,
    isLoading,
    hasError: !!error || !!allChecklistsError,
    refetch
  };
}
