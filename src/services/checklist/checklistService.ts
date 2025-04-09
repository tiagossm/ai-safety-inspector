
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, Checklist, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

// Helper function to fetch company name by ID
async function fetchCompanyNameById(companyId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("fantasy_name")
      .eq("id", companyId)
      .single();
      
    if (error || !data) {
      console.error("Error fetching company name:", error);
      return null;
    }
    
    return data.fantasy_name;
  } catch (error) {
    console.error("Error in fetchCompanyNameById:", error);
    return null;
  }
}

// Helper function to update checklist status
async function updateChecklistStatus(checklistId: string, status: "active" | "inactive"): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("checklists")
      .update({ status })
      .eq("id", checklistId);
      
    if (error) {
      console.error("Error updating checklist status:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateChecklistStatus:", error);
    return false;
  }
}

// Update the status of multiple checklists
async function updateStatus(ids: string[], newStatus: "active" | "inactive"): Promise<{ success: boolean; count: number }> {
  try {
    const { data, error } = await supabase
      .from("checklists")
      .update({ status: newStatus })
      .in("id", ids)
      .select("id");
      
    if (error) {
      console.error("Error updating checklist statuses:", error);
      return { success: false, count: 0 };
    }
    
    return {
      success: true,
      count: data?.length || 0
    };
  } catch (error) {
    console.error("Error in updateStatus:", error);
    return { success: false, count: 0 };
  }
}

// Delete multiple checklists
async function bulkDelete(ids: string[]): Promise<{ success: boolean; count: number }> {
  try {
    // First delete related checklist items
    const { error: itemsError } = await supabase
      .from("checklist_itens")
      .delete()
      .in("checklist_id", ids);
      
    if (itemsError) {
      console.error("Error deleting checklist items:", itemsError);
      return { success: false, count: 0 };
    }
    
    // Then delete the checklists
    const { data, error } = await supabase
      .from("checklists")
      .delete()
      .in("id", ids)
      .select("id");
      
    if (error) {
      console.error("Error deleting checklists:", error);
      return { success: false, count: 0 };
    }
    
    return {
      success: true,
      count: data?.length || 0
    };
  } catch (error) {
    console.error("Error in bulkDelete:", error);
    return { success: false, count: 0 };
  }
}

// Create a new checklist with items
async function createChecklist(checklist: any, questions: any[]) {
  try {
    // Insert the checklist
    const { data: insertedChecklist, error: checklistError } = await supabase
      .from("checklists")
      .insert(checklist)
      .select()
      .single();
      
    if (checklistError) {
      console.error("Error creating checklist:", checklistError);
      return null;
    }
    
    // Map questions to include the checklist ID
    const questionsToInsert = questions.map(question => ({
      ...question,
      checklist_id: insertedChecklist.id
    }));
    
    // Insert questions as an array
    const { error: insertError } = await supabase.from("checklist_itens").insert(questionsToInsert);
    
    if (insertError) {
      console.error("Error inserting checklist items:", insertError);
      return null;
    }
    
    return insertedChecklist;
  } catch (error) {
    console.error("Error in createChecklist:", error);
    return null;
  }
}

// Export the service
export const checklistService = {
  fetchCompanyNameById,
  updateChecklistStatus,
  updateStatus,
  bulkDelete,
  createChecklist
};
