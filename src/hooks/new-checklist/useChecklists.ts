import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";

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

export function useChecklists(filters: ChecklistsFilter = {}) {
  const { 
    page = 1, 
    pageSize = 10, 
    search = "", 
    isTemplate = false 
  } = filters;

  const queryFn = async (): Promise<ChecklistsResult> => {
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

    // Skip templates that are sub-checklists
    query = query.eq('is_sub_checklist', false);

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching checklists:", error);
      throw error;
    }

    // Transform the data to match ChecklistWithStats
    const transformedData: ChecklistWithStats[] = data.map(item => {
      // Handle SelectQueryError case safely
      let responsibleName = "";
      
      // Add null and type checks before accessing name
      if (item.users && typeof item.users === 'object') {
        responsibleName = (item.users as any)?.name ?? "";
      }
      
      return {
        id: item.id,
        title: item.title,
        description: item.description || "",
        isTemplate: item.is_template,
        is_template: item.is_template, // Include both for compatibility
        status: item.status || "active",
        category: item.category || "",
        origin: item.origin || "manual",
        responsibleId: item.responsible_id || "",
        companyId: item.company_id || "",
        userId: item.user_id || "",
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        dueDate: item.due_date,
        isSubChecklist: item.is_sub_checklist || false,
        totalQuestions: 0, // We'll need another query to get this info
        companyName: item.companies?.fantasy_name || "",
        responsibleName: responsibleName,
      };
    });

    return {
      data: transformedData,
      total: count || 0,
      page,
      pageSize
    };
  };

  const result = useQuery({
    queryKey: ['checklists', page, pageSize, search, isTemplate],
    queryFn
  });

  const refreshChecklists = async () => {
    await result.refetch();
  };

  return {
    ...result,
    refreshChecklists
  };
}
