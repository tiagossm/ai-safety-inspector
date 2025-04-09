
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, Checklist, ChecklistQuestion, ChecklistGroup, NewChecklistPayload } from "@/types/newChecklist";
import { toast } from "sonner";

export const checklistService = {
  async fetchChecklists(): Promise<ChecklistWithStats[]> {
    try {
      const { data, error } = await supabase
        .from("checklists")
        .select(`
          id, title, description, is_template, status, category,
          responsible_id, company_id, user_id, created_at, updated_at, due_date, 
          is_sub_checklist, origin, parent_question_id,
          companies:company_id(id, fantasy_name),
          users:responsible_id(id, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform to match ChecklistWithStats interface
      const transformedData: ChecklistWithStats[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        is_template: item.is_template,
        status: item.status as "active" | "inactive",
        category: item.category,
        responsible_id: item.responsible_id,
        company_id: item.company_id,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        due_date: item.due_date,
        is_sub_checklist: item.is_sub_checklist,
        origin: item.origin,
        parent_question_id: item.parent_question_id,
        totalQuestions: 0, // Will be populated later
        completedQuestions: 0, // Will be populated later
        companyName: item.companies?.fantasy_name,
        responsibleName: item.users?.name,
        // For backward compatibility
        isTemplate: item.is_template,
        isSubChecklist: item.is_sub_checklist,
        companyId: item.company_id,
        responsibleId: item.responsible_id,
        userId: item.user_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        dueDate: item.due_date
      }));

      // Fetch question counts for each checklist
      for (const checklist of transformedData) {
        const { count } = await supabase
          .from("checklist_itens")
          .select("*", { count: "exact" })
          .eq("checklist_id", checklist.id);

        checklist.totalQuestions = count || 0;
      }

      return transformedData;
    } catch (error) {
      console.error("Error fetching checklists:", error);
      return [];
    }
  },

  async fetchCompanyNameById(companyId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('fantasy_name')
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      return data?.fantasy_name || '';
    } catch (error) {
      console.error("Error fetching company name:", error);
      return '';
    }
  },

  async updateChecklistStatus(checklistId: string, newStatus: "active" | "inactive"): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('checklists')
        .update({ status: newStatus })
        .eq('id', checklistId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating checklist status:", error);
      return false;
    }
  },

  async updateStatus(ids: string[], newStatus: "active" | "inactive"): Promise<{success: boolean, count: number}> {
    try {
      const { data, error, count } = await supabase
        .from('checklists')
        .update({ status: newStatus })
        .in('id', ids);
      
      if (error) throw error;
      return { success: true, count: count || ids.length };
    } catch (error) {
      console.error("Error updating checklist statuses:", error);
      return { success: false, count: 0 };
    }
  },

  async deleteChecklist(id: string): Promise<boolean> {
    try {
      // First delete all questions associated with this checklist
      const { error: itemsError } = await supabase
        .from('checklist_itens')
        .delete()
        .eq('checklist_id', id);
      
      if (itemsError) {
        console.warn("Error deleting checklist items:", itemsError);
        // Continue with deletion of the main checklist anyway
      }
      
      // Then delete the checklist itself
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error deleting checklist:", error);
      return false;
    }
  },

  async createChecklist(checklistData: NewChecklistPayload): Promise<Checklist | null> {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .insert({
          title: checklistData.title,
          description: checklistData.description,
          is_template: checklistData.is_template,
          status: checklistData.status,
          status_checklist: checklistData.status_checklist || 'ativo',
          category: checklistData.category,
          company_id: checklistData.company_id,
          responsible_id: checklistData.responsible_id,
          due_date: checklistData.due_date,
          user_id: checklistData.user_id,
          origin: checklistData.origin || 'manual'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Error creating checklist:", error);
      return null;
    }
  },
  
  async createQuestionsForChecklist(checklistId: string, questionsToInsert: any[]): Promise<boolean> {
    try {
      if (!questionsToInsert || questionsToInsert.length === 0) {
        return true; // Nothing to insert
      }
      
      const { error } = await supabase
        .from("checklist_itens")
        .insert(questionsToInsert);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error creating checklist questions:", error);
      return false;
    }
  }
};
