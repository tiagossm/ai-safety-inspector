import { ChecklistWithStats } from "@/types/newChecklist";

/**
 * Determine the origin of a checklist based on its properties
 * @param checklist The checklist to analyze
 * @returns The determined origin type: 'manual', 'ia', or 'csv'
 */
export const determineChecklistOrigin = (checklist: ChecklistWithStats): "manual" | "ia" | "csv" => {
  // If the origin is explicitly set, use it
  if (checklist.origin && ["manual", "ia", "csv"].includes(checklist.origin)) {
    return checklist.origin as "manual" | "ia" | "csv";
  }
  
  // Otherwise try to infer based on other characteristics
  // This is a fallback logic that can be refined
  if (checklist.title?.toLowerCase().includes('ia generated') || 
      checklist.description?.toLowerCase().includes('ia generated')) {
    return "ia";
  } else if (checklist.title?.toLowerCase().includes('importado') || 
             checklist.description?.toLowerCase().includes('csv')) {
    return "csv";
  }
  
  // Default to manual if we can't determine
  return "manual";
};

/**
 * Update checklist statuses in bulk
 * @param ids Array of checklist IDs to update
 * @param newStatus The new status to apply
 * @returns A promise that resolves when the update is complete
 */
export const bulkUpdateChecklistStatus = async (
  ids: string[],
  newStatus: 'active' | 'inactive'
) => {
  // Implementation will depend on the specific backend service being used
  // This is a placeholder for the function structure
  try {
    // Example implementation with a REST API call
    const response = await fetch('/api/checklists/bulk-update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids,
        status: newStatus,
        status_checklist: newStatus === 'active' ? 'ativo' : 'inativo'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error updating statuses: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating checklist statuses:', error);
    throw error;
  }
};
