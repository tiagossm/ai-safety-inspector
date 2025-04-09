
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Deletes a checklist by ID
 */
export async function deleteChecklistById(checklistId: string) {
  const { error } = await supabase
    .from("checklists")
    .delete()
    .eq("id", checklistId);

  if (error) {
    console.error("Error deleting checklist:", error);
    throw error;
  }

  return { success: true };
}

/**
 * Updates checklist status
 */
export async function updateChecklistStatus(checklistId: string, newStatus: 'active' | 'inactive') {
  const { error } = await supabase
    .from('checklists')
    .update({ 
      status: newStatus,
      status_checklist: newStatus === 'active' ? 'ativo' : 'inativo'
    })
    .eq('id', checklistId);
    
  if (error) {
    console.error("Error updating checklist status:", error);
    throw error;
  }
  
  return { success: true };
}

/**
 * Updates status for multiple checklists
 */
export async function updateBulkChecklistStatus(checklistIds: string[], newStatus: 'active' | 'inactive') {
  const { error } = await supabase
    .from('checklists')
    .update({ 
      status: newStatus,
      status_checklist: newStatus === 'active' ? 'ativo' : 'inativo' 
    })
    .in('id', checklistIds);
    
  if (error) {
    console.error("Error updating multiple checklists status:", error);
    throw error;
  }
  
  return { success: true, count: checklistIds.length };
}
