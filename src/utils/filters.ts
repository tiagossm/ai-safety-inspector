
import { ChecklistWithStats } from "@/types/newChecklist";

/**
 * Filter checklists by search term
 */
export function filterBySearchTerm(
  checklists: ChecklistWithStats[],
  searchTerm: string
): ChecklistWithStats[] {
  if (!searchTerm.trim()) {
    return checklists;
  }
  
  const normalized = searchTerm.trim().toLowerCase();
  
  return checklists.filter(checklist => 
    checklist.title.toLowerCase().includes(normalized) ||
    checklist.description?.toLowerCase().includes(normalized) ||
    checklist.category?.toLowerCase().includes(normalized) ||
    checklist.companyName?.toLowerCase().includes(normalized)
  );
}

/**
 * Filter checklists by type (template, active, inactive)
 */
export function filterByType(
  checklists: ChecklistWithStats[],
  type: string
): ChecklistWithStats[] {
  if (type === "all") {
    return checklists;
  }
  
  if (type === "template") {
    return checklists.filter(c => c.isTemplate);
  }
  
  if (type === "active") {
    return checklists.filter(c => c.status === "active" && !c.isTemplate);
  }
  
  if (type === "inactive") {
    return checklists.filter(c => c.status === "inactive" && !c.isTemplate);
  }
  
  return checklists;
}

/**
 * Sort checklists by different criteria
 */
export function sortChecklists(
  checklists: ChecklistWithStats[],
  sortOrder: string
): ChecklistWithStats[] {
  if (sortOrder === "created_desc") {
    return [...checklists].sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  
  if (sortOrder === "created_asc") {
    return [...checklists].sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }
  
  if (sortOrder === "title_asc") {
    return [...checklists].sort((a, b) => a.title.localeCompare(b.title));
  }
  
  if (sortOrder === "title_desc") {
    return [...checklists].sort((a, b) => b.title.localeCompare(a.title));
  }
  
  return checklists;
}
