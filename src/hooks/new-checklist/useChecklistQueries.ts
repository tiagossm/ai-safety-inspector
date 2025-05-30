
import { useQuery } from "@tanstack/react-query";
import { fetchChecklists, fetchAllChecklistsData } from "@/services/checklist/checklistQueryService";
import { ChecklistWithStats } from "@/types/newChecklist";

/**
 * Hook for fetching checklist data with filters
 */
export function useChecklistQueries(
  filterType: string = "all",
  companyId: string = "all",
  category: string = "all",
  origin: string = "all",
  sortOrder: string = "created_at_desc"
) {
  // Fetch filtered checklists
  const { 
    data: checklists = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["new-checklists", filterType, companyId, category, origin, sortOrder],
    queryFn: () => fetchChecklists(filterType, companyId, category, origin, sortOrder),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true
  });
  
  // Fetch all checklists data for client-side filtering
  const { 
    data: allChecklists = [],
    isLoading: isLoadingAll,
    error: allError
  } = useQuery({
    queryKey: ["all-new-checklists"],
    queryFn: fetchAllChecklistsData,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false
  });
  
  return {
    checklists: checklists as ChecklistWithStats[],
    allChecklists: allChecklists as ChecklistWithStats[],
    isLoading: isLoading || isLoadingAll,
    error: error || allError,
    refetch
  };
}
