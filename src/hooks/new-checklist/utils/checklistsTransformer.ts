
import { ChecklistWithStats } from "@/types/newChecklist";
import { transformResponseToChecklistWithStats } from "@/services/checklist/checklistTransformers";

/**
 * Transforms raw checklist data to the ChecklistWithStats type
 */
export function transformChecklistsData(data: any[]): ChecklistWithStats[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  return data.map(item => {
    // Safely extract responsible name with proper type checking and null safeguards
    let responsibleName = "";
    
    if (item?.users !== null && typeof item?.users === 'object') {
      // Using type assertion with the nullish coalescing operator for safety
      responsibleName = (item.users as any)?.name ?? "";
    }
    
    return transformResponseToChecklistWithStats({
      ...item,
      responsibleName
    });
  });
}
