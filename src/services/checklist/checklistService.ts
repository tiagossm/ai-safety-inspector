
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";
import { toast } from "sonner";

/**
 * Fetches checklists with filters
 */
export async function fetchChecklists(
  filterType = "all", 
  selectedCompanyId = "all", 
  selectedCategory = "all",
  sortOrder = "created_desc"
): Promise<ChecklistWithStats[]> {
  try {
    const [sortColumn, sortDirection] = sortOrder.split('_');
    
    let query = supabase
      .from("checklists")
      .select(`
        *,
        company:company_id (
          id, fantasy_name
        )
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
    
    // Apply sort
    query = query.order(sortColumn || "created_at", { ascending: sortDirection === "asc" });
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Transform data to match ChecklistWithStats type
    return data.map(checklist => ({
      id: checklist.id,
      title: checklist.title,
      description: checklist.description,
      isTemplate: checklist.is_template,
      status: checklist.status,
      category: checklist.category,
      responsibleId: checklist.responsible_id,
      companyId: checklist.company_id,
      userId: checklist.user_id,
      createdAt: checklist.created_at,
      updatedAt: checklist.updated_at,
      dueDate: checklist.due_date,
      isSubChecklist: checklist.is_sub_checklist,
      origin: checklist.origin,
      totalQuestions: 0, // Default value, may be updated from total_items if exists
      completedQuestions: 0, // Default value, may be updated from completed_items if exists
      companyName: checklist.company?.fantasy_name || "Sem empresa",
      stats: {
        total: checklist.total_items || 0,
        completed: checklist.completed_items || 0
      }
    }));
  } catch (error) {
    console.error("Error fetching checklists:", error);
    throw error;
  }
}

/**
 * Fetches all checklist data for client-side filtering
 */
export async function fetchAllChecklistsData(): Promise<ChecklistWithStats[]> {
  try {
    const { data, error } = await supabase
      .from("checklists")
      .select(`
        *,
        company:company_id (
          id, fantasy_name
        )
      `)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    
    // Transform data to match ChecklistWithStats type
    return data.map(checklist => ({
      id: checklist.id,
      title: checklist.title,
      description: checklist.description,
      isTemplate: checklist.is_template,
      status: checklist.status,
      category: checklist.category,
      responsibleId: checklist.responsible_id,
      companyId: checklist.company_id,
      userId: checklist.user_id,
      createdAt: checklist.created_at,
      updatedAt: checklist.updated_at,
      dueDate: checklist.due_date,
      isSubChecklist: checklist.is_sub_checklist,
      origin: checklist.origin,
      totalQuestions: 0, // Default value
      completedQuestions: 0, // Default value
      companyName: checklist.company?.fantasy_name || "Sem empresa",
      stats: {
        total: checklist.total_items || 0,
        completed: checklist.completed_items || 0
      }
    }));
  } catch (error) {
    console.error("Error fetching all checklists data:", error);
    throw error;
  }
}

/**
 * Fetches companies for the filter dropdown
 */
export async function fetchCompanies() {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("id, fantasy_name")
      .eq("status", "active") // Filtra apenas empresas ativas
      .order("fantasy_name");
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}
