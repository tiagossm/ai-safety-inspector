
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, Checklist, ChecklistQuestion, ChecklistGroup, ChecklistOrigin } from "@/types/newChecklist";
import { transformDbChecklistsToStats, transformChecklistsForUI } from "./checklistTransformers";
import { PostgrestError } from "@supabase/supabase-js";

export const checklistService = {
  /**
   * Fetches all checklists for the current user or company
   */
  async fetchChecklists(): Promise<ChecklistWithStats[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user || !user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return transformDbChecklistsToStats(data || []);
    } catch (error) {
      console.error('Error fetching checklists:', error);
      throw error;
    }
  },
  
  /**
   * Fetches a single checklist by ID
   */
  async fetchChecklistById(id: string): Promise<ChecklistWithStats> {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }
      
      // Get question count
      const { count: totalQuestions, error: countError } = await supabase
        .from('checklist_itens')
        .select('*', { count: 'exact', head: true })
        .eq('checklist_id', id);

      if (countError) {
        console.error('Error fetching question count:', countError);
      }
      
      // Transform to the expected format
      const result = {
        ...data,
        totalQuestions: totalQuestions || 0,
        completedQuestions: 0,
        companyName: data.companies?.fantasy_name || '',
        responsibleName: ''
      };
      
      return transformDbChecklistsToStats([result])[0];
    } catch (error) {
      console.error('Error fetching checklist by ID:', error);
      throw error;
    }
  },

  /**
   * Updates the status of the specified checklists
   */
  async updateStatus(
    ids: string[], 
    status: "active" | "inactive"
  ): Promise<{ success: boolean; count: number }> {
    if (!ids.length) {
      return { success: true, count: 0 };
    }
    
    try {
      const { data, error, count } = await supabase
        .from('checklists')
        .update({ status })
        .in('id', ids);
      
      return { 
        success: !error, 
        count: count || 0
      };
    } catch (error) {
      console.error('Error updating checklist status:', error);
      throw error;
    }
  },
  
  /**
   * Creates a new checklist
   */
  async createChecklist(
    checklistData: Partial<Checklist>
  ): Promise<{ id: string }> {
    try {
      // Ensure required fields
      if (!checklistData.title) {
        throw new Error("Checklist title is required");
      }
      
      const { data, error } = await supabase
        .from('checklists')
        .insert(checklistData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return { id: data.id };
    } catch (error) {
      console.error('Error creating checklist:', error);
      throw error;
    }
  },
  
  /**
   * Deletes a checklist by ID
   */
  async deleteChecklist(id: string): Promise<{ success: boolean }> {
    try {
      // First delete all items associated with this checklist
      const { error: itemsError } = await supabase
        .from('checklist_itens')
        .delete()
        .eq('checklist_id', id);
        
      if (itemsError) {
        console.error('Error deleting checklist items:', itemsError);
        // Continue anyway to delete the checklist
      }
      
      // Then delete the checklist
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id);
      
      return { success: !error };
    } catch (error) {
      console.error('Error deleting checklist:', error);
      throw error;
    }
  }
};
