
import { supabase } from "@/integrations/supabase/client";
import { NewChecklistPayload } from "@/types/newChecklist";

export const checklistCreateService = {
  createChecklist: async (checklistData: NewChecklistPayload): Promise<string | null> => {
    try {
      console.log("Creating new checklist with data:", checklistData);
      
      // Make sure origin is set with a valid default
      const finalChecklistData = {
        ...checklistData,
        origin: checklistData.origin || 'manual'
      };
      
      const { data, error } = await supabase
        .from('checklists')
        .insert(finalChecklistData)
        .select('id')
        .single();
      
      if (error) {
        console.error("Error creating checklist:", error);
        throw error;
      }
      
      console.log("Successfully created checklist with ID:", data.id);
      return data.id;
    } catch (error) {
      console.error("Error in checklist creation service:", error);
      return null;
    }
  }
};
