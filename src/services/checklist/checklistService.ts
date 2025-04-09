
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, Checklist, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

// Export the service as a named export
export const checklistService = {
  async fetchChecklists(
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
  },

  async fetchAllChecklistsData() {
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
  },

  async fetchCompanies() {
    const { data, error } = await supabase
      .from("companies")
      .select("id, fantasy_name")
      .eq("status", "active")
      .order("fantasy_name", { ascending: true });

    if (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }

    return data;
  },

  async fetchCompanyNameById(companyId: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('fantasy_name')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error("Error fetching company name:", error);
      throw error;
    }

    return data?.fantasy_name || null;
  },

  async deleteChecklistById(checklistId: string) {
    const { error } = await supabase
      .from("checklists")
      .delete()
      .eq("id", checklistId);

    if (error) {
      throw error;
    }
  },

  async updateChecklistStatus(checklistId: string, newStatus: 'active' | 'inactive') {
    const { error } = await supabase
      .from('checklists')
      .update({ 
        status: newStatus,
        status_checklist: newStatus === 'active' ? 'ativo' : 'inativo'
      })
      .eq('id', checklistId);
      
    if (error) {
      throw error;
    }
  },

  async updateBulkChecklistStatus(checklistIds: string[], newStatus: 'active' | 'inactive') {
    const { error } = await supabase
      .from('checklists')
      .update({ 
        status: newStatus,
        status_checklist: newStatus === 'active' ? 'ativo' : 'inativo' 
      })
      .in('id', checklistIds);
      
    if (error) {
      throw error;
    }
  },

  async updateStatus(ids: string[], newStatus: 'active' | 'inactive') {
    try {
      await this.updateBulkChecklistStatus(ids, newStatus);
      return { success: true, count: ids.length };
    } catch (error) {
      console.error("Error updating checklist status:", error);
      return { success: false, count: 0 };
    }
  },

  async createChecklist(
    checklist: Record<string, any>,
    questions: ChecklistQuestion[],
    groups: ChecklistGroup[]
  ) {
    // Implementation for creating a checklist
    const { data, error } = await supabase
      .from("checklists")
      .insert([checklist])
      .select()
      .single();

    if (error) {
      console.error("Error creating checklist:", error);
      throw error;
    }

    // Process and add questions, groups, etc.
    // This is a placeholder for the actual implementation
    console.log("Created checklist:", data);
    
    return { id: data.id };
  }
};

// Helper functions to transform data
function transformChecklistData(data: any[]): ChecklistWithStats[] {
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isTemplate: item.is_template,
    status: item.status,
    category: item.category,
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
    status: item.status,
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
