
import { useQuery } from "@tanstack/react-query";
import { 
  fetchChecklists, 
  fetchAllChecklistsData 
} from "@/services/checklist/checklistQueryService";
import { ChecklistWithStats } from "@/types/newChecklist";

/**
 * Hook for querying checklists with filters
 */
export function useChecklistsQuery(
  filterType: string, 
  selectedCompanyId: string, 
  selectedCategory: string,
  selectedOrigin: string,
  sortOrder: string
) {
  // Fetch checklists with applied filters
  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ["new-checklists", filterType, selectedCompanyId, selectedCategory, selectedOrigin, sortOrder],
    queryFn: async () => {
      return fetchChecklists(filterType, selectedCompanyId, selectedCategory, sortOrder);
    }
  });

  return {
    checklists,
    isLoading
  };
}

/**
 * Hook for querying a single checklist by ID
 */
export function useChecklistQuery(id: string) {
  const { data: checklist, isLoading, error } = useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      // This would need to be implemented in your service
      return fetchChecklistById(id);
    },
    enabled: !!id
  });

  return {
    checklist,
    isLoading,
    error
  };
}

/**
 * Hook for querying all checklists data (for filtering)
 */
export function useAllChecklistsQuery() {
  const { data: allChecklists = [] } = useQuery({
    queryKey: ["all-checklists-data"],
    queryFn: async () => {
      return fetchAllChecklistsData();
    }
  });

  return {
    allChecklists
  };
}

// This is a stub - you would need to implement this in your service
async function fetchChecklistById(id: string): Promise<ChecklistWithStats | null> {
  // Implementation would be similar to fetchChecklists but for a single item
  const data = await fetch(`/api/checklists/${id}`).then(res => res.json());
  return data;
}

/**
 * Combined hook for querying checklists with filters
 */
export function useChecklistQueries(
  filterType: string, 
  selectedCompanyId: string, 
  selectedCategory: string,
  selectedOrigin: string,
  sortOrder: string
) {
  // Fetch checklists with applied filters
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
