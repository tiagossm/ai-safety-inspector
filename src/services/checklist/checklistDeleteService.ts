
import { supabase } from "@/integrations/supabase/client";

export const checklistDeleteService = {
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
  }
};

