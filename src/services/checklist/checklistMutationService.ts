
import { supabase } from "@/integrations/supabase/client";

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
      await supabase
        .from("checklist_item_comments")
        .delete()
        .in("checklist_item_id", itemIds);
      
      // Delete any media related to items
      await supabase
        .from("checklist_item_media")
        .delete()
        .in("checklist_item_id", itemIds);
    }
    
    // Delete the items
    console.log("Deleting checklist items");
    await supabase
      .from("checklist_itens")
      .delete()
      .eq("checklist_id", checklistId);
      
    // Delete any checklist permissions
    await supabase
      .from("checklist_permissions")
      .delete()
      .eq("checklist_id", checklistId);
      
    // Delete any checklist history
    await supabase
      .from("checklist_history")
      .delete()
      .eq("checklist_id", checklistId);
      
    // Delete any checklist comments
    await supabase
      .from("checklist_comments")
      .delete()
      .eq("checklist_id", checklistId);
      
    // Delete any checklist attachments
    await supabase
      .from("checklist_attachments")
      .delete()
      .eq("checklist_id", checklistId);
    
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

/**
 * Bulk delete checklists
 */
export async function deleteBulkChecklistsById(checklistIds: string[]): Promise<{ success: boolean, count: number, failed?: number }> {
  if (!checklistIds.length) return { success: true, count: 0 };
  
  let successCount = 0;
  let failCount = 0;
  
  // Process each deletion sequentially to avoid overwhelming the server
  for (const id of checklistIds) {
    try {
      await deleteChecklistById(id);
      successCount++;
    } catch (err) {
      console.error(`Failed to delete checklist ${id}:`, err);
      failCount++;
    }
    
    // Small delay between operations to reduce database load
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { 
    success: successCount > 0, 
    count: successCount, 
    failed: failCount 
  };
}
