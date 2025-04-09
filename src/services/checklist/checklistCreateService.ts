
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const checklistCreateService = {
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
        status: checklistData.status === 'active' ? 'active' : 'inactive',
        category: checklistData.category || '',
        responsible_id: checklistData.responsible_id || null,
        company_id: checklistData.company_id || null,
        user_id: checklistData.user_id || null,
        origin: (checklistData.origin || 'manual')
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
  }
};

