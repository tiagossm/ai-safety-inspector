
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, Checklist, ChecklistQuestion, ChecklistGroup, ChecklistOrigin } from "@/types/newChecklist";
import { toast } from "sonner";

export const checklistService = {
  fetchChecklists: async (): Promise<ChecklistWithStats[]> => {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match the expected format
      const checklists: ChecklistWithStats[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        is_template: item.is_template || false,
        isTemplate: item.is_template || false,
        status: item.status || 'active',
        category: item.category || '',
        responsible_id: item.responsible_id,
        responsibleId: item.responsible_id,
        company_id: item.company_id,
        companyId: item.company_id,
        user_id: item.user_id,
        userId: item.user_id,
        created_at: item.created_at,
        createdAt: item.created_at,
        updated_at: item.updated_at,
        updatedAt: item.updated_at,
        due_date: item.due_date,
        dueDate: item.due_date,
        is_sub_checklist: item.is_sub_checklist || false,
        isSubChecklist: item.is_sub_checklist || false,
        origin: item.origin || 'manual',
        parent_question_id: item.parent_question_id,
        parent_question_id: item.parent_question_id,
        totalQuestions: 0,
        completedQuestions: 0,
        companyName: item.companies?.fantasy_name || '',
        responsibleName: ''
      }));
      
      return checklists;
    } catch (error) {
      console.error("Error fetching checklists:", error);
      return [];
    }
  },

  fetchChecklistById: async (id: string): Promise<ChecklistWithStats> => {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name),
          users:user_id (id, name)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }

      // Return formatted data
      const checklist: ChecklistWithStats = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        is_template: data.is_template || false,
        isTemplate: data.is_template || false,
        status: data.status || 'active',
        category: data.category || '',
        responsible_id: data.responsible_id,
        responsibleId: data.responsible_id,
        company_id: data.company_id,
        companyId: data.company_id,
        user_id: data.user_id,
        userId: data.user_id,
        created_at: data.created_at,
        createdAt: data.created_at,
        updated_at: data.updated_at,
        updatedAt: data.updated_at,
        due_date: data.due_date,
        dueDate: data.due_date,
        is_sub_checklist: data.is_sub_checklist || false,
        isSubChecklist: data.is_sub_checklist || false,
        origin: data.origin || 'manual',
        parent_question_id: data.parent_question_id,
        parentQuestionId: data.parent_question_id,
        totalQuestions: 0,
        completedQuestions: 0,
        companyName: data.companies?.fantasy_name || '',
        responsibleName: data.users?.name || ''
      };
      
      return checklist;
    } catch (error) {
      console.error("Error fetching checklist by ID:", error);
      throw error;
    }
  },

  updateStatus: async (ids: string[], status: "active" | "inactive"): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .update({ status })
        .in('id', ids);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating checklist status:", error);
      return false;
    }
  },

  createChecklist: async (checklistData: { 
    title: string;
    [key: string]: any;
  }): Promise<{ id: string; error: any }> => {
    try {
      // Ensure title is present
      if (!checklistData.title) {
        throw new Error("Checklist title is required");
      }

      const payload = {
        title: checklistData.title,
        description: checklistData.description || '',
        is_template: checklistData.is_template || false,
        status: checklistData.status || 'active',
        category: checklistData.category || '',
        responsible_id: checklistData.responsible_id || null,
        company_id: checklistData.company_id || null,
        user_id: checklistData.user_id || null,
        origin: checklistData.origin || 'manual'
      };

      const { data, error } = await supabase
        .from('checklists')
        .insert(payload)
        .select()
        .single();
      
      if (error) throw error;
      
      return { id: data.id, error: null };
    } catch (error) {
      console.error("Error creating checklist:", error);
      return { id: '', error };
    }
  },

  deleteChecklist: async (id: string): Promise<boolean> => {
    try {
      // First delete any related items
      const { error: itemsError } = await supabase
        .from('checklist_itens')
        .delete()
        .eq('checklist_id', id);
      
      if (itemsError) {
        console.error("Error deleting checklist items:", itemsError);
      }
      
      // Then delete the checklist
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

  // Add the missing methods needed in ChecklistRow
  fetchCompanyNameById: async (companyId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('fantasy_name')
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      return data?.fantasy_name || null;
    } catch (error) {
      console.error("Error fetching company name:", error);
      return null;
    }
  },
  
  updateChecklistStatus: async (checklistId: string, status: "active" | "inactive"): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('checklists')
        .update({ status })
        .eq('id', checklistId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating checklist status:", error);
      return false;
    }
  }
};
