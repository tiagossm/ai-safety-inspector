
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";

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
  if (sortOrder === "created_desc") {
    query = query.order("created_at", { ascending: false });
  } else if (sortOrder === "created_asc") {
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

// Helper functions to transform data
function transformChecklistData(data: any[]): ChecklistWithStats[] {
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isTemplate: item.is_template,
    is_template: item.is_template, // Adding this to satisfy type requirement
    status: item.status,
    category: item.category,
    theme: item.theme || item.category, // Using theme with category fallback
    responsibleId: item.responsible_id,
    companyId: item.company_id,
    userId: item.user_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    dueDate: item.due_date,
    isSubChecklist: item.is_sub_checklist,
    origin: item.origin,
    totalQuestions: item.checklist_itens?.length || 0,
    completedQuestions: 0,
    companyName: item.companies?.fantasy_name,
    responsibleName: item.users?.name
  }));
}

function transformBasicChecklistData(data: any[]): ChecklistWithStats[] {
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isTemplate: item.is_template,
    is_template: item.is_template, // Adding this to satisfy type requirement
    status: item.status,
    theme: item.theme || item.category, // Using theme with category fallback
    isSubChecklist: item.is_sub_checklist,
    category: item.category,
    companyId: item.company_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    origin: item.origin,
    totalQuestions: 0,
    completedQuestions: 0
  }));
}
