
import { supabase } from "@/integrations/supabase/client";

export const checklistStatusService = {
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

