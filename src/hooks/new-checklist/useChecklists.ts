
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";
import { transformResponseToChecklistWithStats } from "@/services/checklist/checklistTransformers";

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
      // Build base query
      let query = supabase
        .from('checklists')
        .select(`
          *,
          companies(*),
          users:responsible_id(*)
        `, { count: 'exact' });

      // Apply filters
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      if (isTemplate !== undefined) {
        query = query.eq('is_template', isTemplate);
      }

      if (status) {
        query = query.eq('status', status);
      }

      // Skip templates that are sub-checklists
      query = query.eq('is_sub_checklist', false);

      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

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

      // Transform the response data to match ChecklistWithStats type
      const transformedData = data.map(transformResponseToChecklistWithStats);

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
