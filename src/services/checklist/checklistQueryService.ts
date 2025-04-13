
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";
import { transformChecklistData, transformBasicChecklistData } from "./checklistTransformers";

/**
 * Fetches checklists with filters and sorting
 */
export async function fetchChecklists(
  filterType: string,
  selectedCompanyId: string,
  selectedCategory: string,
  selectedOrigin: string = "all",
  sortOrder: string = "created_at_desc"
) {
  let query = supabase
    .from("checklists")
    .select(`
      *,
      checklist_itens(count),
      companies(fantasy_name),
      users!checklists_responsible_id_fkey(name)
    `);

  // Apply filters
  if (filterType === "template") {
    query = query.eq("is_template", true);
  } else if (filterType === "active") {
    query = query.eq("status", "active").eq("is_template", false);
  } else if (filterType === "inactive") {
    query = query.eq("status", "inactive").eq("is_template", false);
  }

  if (selectedCompanyId !== "all") {
    query = query.eq("company_id", selectedCompanyId);
  }

  if (selectedCategory !== "all") {
    query = query.eq("category", selectedCategory);
  }
  
  if (selectedOrigin !== "all") {
    query = query.eq("origin", selectedOrigin);
  }

  // Extract sort column and direction from sortOrder
  let sortColumn = "created_at";
  let sortDirection: 'asc' | 'desc' = "desc";
    
  if (sortOrder) {
    const parts = sortOrder.split('_');
    if (parts.length > 1) {
      sortColumn = parts.slice(0, -1).join('_'); // Handle multi-part column names like "created_at"
      sortDirection = parts[parts.length - 1] === 'asc' ? 'asc' : 'desc';
    }
  }
  
  // Apply sort
  query = query.order(sortColumn, { ascending: sortDirection === "asc" });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching checklists:", error);
    throw error;
  }

  return transformChecklistData(data);
}

/**
 * Fetches all checklist data for filtering
 */
export async function fetchAllChecklistsData() {
  const { data, error } = await supabase
    .from("checklists")
    .select(`
      id, title, description, is_template, status, category, 
      company_id, created_at, updated_at, is_sub_checklist, origin
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all checklists data:", error);
    throw error;
  }

  return transformBasicChecklistData(data);
}

/**
 * Fetches a specific checklist by ID
 */
export async function fetchChecklistById(id: string) {
  const { data, error } = await supabase
    .from("checklists")
    .select(`
      *,
      checklist_itens(count),
      companies(fantasy_name),
      users!checklists_responsible_id_fkey(name)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching checklist ${id}:`, error);
    throw error;
  }

  return transformChecklistData([data])[0];
}
