
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
  sortOrder: string
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

  // Apply sorting
  if (sortOrder === "created_at_desc") {
    query = query.order("created_at", { ascending: false });
  } else if (sortOrder === "created_at_asc") {
    query = query.order("created_at", { ascending: true });
  } else if (sortOrder === "title_asc") {
    query = query.order("title", { ascending: true });
  } else if (sortOrder === "title_desc") {
    query = query.order("title", { ascending: false });
  }

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
    `);

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
