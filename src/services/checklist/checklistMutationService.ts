
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Deletes a checklist by ID
 */
export async function deleteChecklistById(checklistId: string) {
  console.log("Starting deletion of checklist:", checklistId);
  
  try {
    // First check if the checklist exists
    const { data: checklistData, error: checkError } = await supabase
      .from("checklists")
      .select("id, title")
      .eq("id", checklistId)
      .single();
      
    if (checkError) {
      console.error("Error checking checklist:", checkError);
      throw new Error("Não foi possível encontrar o checklist");
    }
    
    // Get all items for this checklist to clean them up first
    const { data: itemsData } = await supabase
      .from("checklist_itens")
      .select("id")
      .eq("checklist_id", checklistId);
      
    const itemIds = itemsData?.map(item => item.id) || [];
    
    // If there are items, delete any related data first
    if (itemIds.length > 0) {
      console.log(`Deleting metadata for ${itemIds.length} items`);
      
      // Delete any comments related to items
      const { error: commentError } = await supabase
        .from("checklist_item_comments")
        .delete()
        .in("checklist_item_id", itemIds);
      
      if (commentError) {
        console.log("Error deleting item comments:", commentError);
        // Continue with deletion even if this fails
      }
      
      // Delete any media related to items
      const { error: mediaError } = await supabase
        .from("checklist_item_media")
        .delete()
        .in("checklist_item_id", itemIds);
      
      if (mediaError) {
        console.log("Error deleting item media:", mediaError);
        // Continue with deletion even if this fails
      }
    }
    
    // Delete the items
    console.log("Deleting checklist items");
    const { error: itemsError } = await supabase
      .from("checklist_itens")
      .delete()
      .eq("checklist_id", checklistId);
      
    if (itemsError) {
      console.error("Error deleting checklist items:", itemsError);
      // Continue anyway to try to delete the checklist
    }
    
    // Delete any checklist permissions
    const { error: permissionsError } = await supabase
      .from("checklist_permissions")
      .delete()
      .eq("checklist_id", checklistId);
      
    if (permissionsError) {
      console.log("Error deleting checklist permissions:", permissionsError);
      // Continue with deletion even if this fails
    }
    
    // Delete any checklist history
    const { error: historyError } = await supabase
      .from("checklist_history")
      .delete()
      .eq("checklist_id", checklistId);
      
    if (historyError) {
      console.log("Error deleting checklist history:", historyError);
      // Continue with deletion even if this fails
    }
    
    // Delete any checklist comments
    const { error: commentsError } = await supabase
      .from("checklist_comments")
      .delete()
      .eq("checklist_id", checklistId);
      
    if (commentsError) {
      console.log("Error deleting checklist comments:", commentsError);
      // Continue with deletion even if this fails
    }
    
    // Delete any checklist attachments
    const { error: attachmentsError } = await supabase
      .from("checklist_attachments")
      .delete()
      .eq("checklist_id", checklistId);
      
    if (attachmentsError) {
      console.log("Error deleting checklist attachments:", attachmentsError);
      // Continue with deletion even if this fails
    }
    
    // Finally delete the checklist
    console.log("Deleting checklist");
    const { error } = await supabase
      .from("checklists")
      .delete()
      .eq("id", checklistId);
      
    if (error) {
      console.error("Error deleting checklist:", error);
      throw error;
    }
    
    console.log("Successfully deleted checklist:", checklistId);
    return { success: true, id: checklistId };
  } catch (error) {
    console.error("Full error in deleteChecklistById:", error);
    throw error;
  }
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
