
import { useQuery } from "@tanstack/react-query";
import { ChecklistWithStats } from "@/types/newChecklist";
import { buildChecklistsQuery } from "./utils/checklistQueryBuilder";
import { transformChecklistsData } from "./utils/checklistsTransformer";

interface ChecklistsFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  isTemplate?: boolean;
  status?: string;
}

interface ChecklistsResult {
  data: ChecklistWithStats[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Hook for fetching checklists with filtering, pagination and search
 */
export function useChecklists(filters: ChecklistsFilter = {}) {
  const { 
    page = 1, 
    pageSize = 10, 
    search = "", 
    isTemplate = false,
    status
  } = filters;

  const queryFn = async (): Promise<ChecklistsResult> => {
    try {
      // Build and execute the Supabase query
      const query = buildChecklistsQuery({
        page,
        pageSize,
        search,
        isTemplate,
        status
      });
      
      // Execute query
      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching checklists:", error);
        throw error;
      }

      if (!data) {
        return {
          data: [],
          total: 0,
          page,
          pageSize
        };
      }

      // Transform the response data
      const transformedData = transformChecklistsData(data);

      return {
        data: transformedData,
        total: count || 0,
        page,
        pageSize
      };
    } catch (err) {
      console.error("Failed to fetch checklists:", err);
      throw err;
    }
  };

  const result = useQuery({
    queryKey: ['checklists', page, pageSize, search, isTemplate, status],
    queryFn,
    staleTime: 30000, // 30 seconds
    gcTime: 300000 // 5 minutes
  });

  const refreshChecklists = async () => {
    await result.refetch();
  };

  return {
    ...result,
    refreshChecklists
  };
}
