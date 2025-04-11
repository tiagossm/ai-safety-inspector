
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { transformChecklists } from '@/services/checklist/checklistTransformers';
import { ChecklistWithStats } from '@/types/newChecklist';

interface UseChecklistsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isTemplate?: boolean;
}

/**
 * Hook for fetching checklists with pagination and filtering
 */
export function useChecklists({ page = 1, pageSize = 10, search = '', isTemplate = false }: UseChecklistsParams = {}) {
  const query = useQuery({
    queryKey: ['checklists', page, pageSize, search, isTemplate],
    queryFn: async () => {
      // Calculate the range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Start building the query
      let query = supabase
        .from("checklists")
        .select(`
          *,
          companies(*),
          users:responsible_id(*)
        `, { count: 'exact' });

      // Apply template filter
      if (isTemplate !== undefined) {
        query = query.eq('is_template', isTemplate);
      }

      // Apply search filter
      if (search && search.trim() !== '') {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Add pagination
      query = query.range(from, to).order("created_at", { ascending: false });

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Transform the data to match our frontend model
      const transformedData = transformChecklists(data || []);

      return {
        data: transformedData,
        total: count || 0,
        page,
        pageSize
      };
    },
    keepPreviousData: true,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refreshChecklists: query.refetch,
  };
}
