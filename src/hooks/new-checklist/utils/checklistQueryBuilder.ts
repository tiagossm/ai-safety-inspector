
import { supabase } from "@/integrations/supabase/client";

/**
 * Builds a Supabase query for checklists based on filters
 */
export function buildChecklistsQuery(filters: {
  page?: number;
  pageSize?: number;
  search?: string;
  isTemplate?: boolean;
  status?: string;
}) {
  const { 
    page = 1, 
    pageSize = 10, 
    search = "", 
    isTemplate = false,
    status
  } = filters;

  // Build base query with explicit relationship paths to avoid ambiguity
  let query = supabase
    .from('checklists')
    .select(`
      *,
      companies:company_id(*),
      users:responsible_id(id, name, email)
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

  return query;
}
