
import { ChecklistWithStats, ChecklistOrigin, Checklist } from "@/types/newChecklist";

/**
 * Maps database field names to their client-side equivalents to maintain 
 * backward compatibility with legacy code
 */
interface FieldMapping {
  source: keyof any;
  target: string; // Changed from keyof ChecklistWithStats to string to avoid type errors
}

/**
 * Field mappings for backward compatibility
 */
const FIELD_MAPPINGS: FieldMapping[] = [
  { source: "is_template", target: "isTemplate" },
  { source: "is_sub_checklist", target: "isSubChecklist" },
  { source: "company_id", target: "companyId" },
  { source: "responsible_id", target: "responsibleId" },
  { source: "user_id", target: "userId" },
  { source: "created_at", target: "createdAt" },
  { source: "updated_at", target: "updatedAt" },
  { source: "due_date", target: "dueDate" },
  { source: "parent_question_id", target: "parent_question_id" } // Fixed: using the correct property name that exists in ChecklistWithStats
];

/**
 * Transforms database checklist data to the client-side ChecklistWithStats type
 * @param data - Raw checklist data from database
 * @returns Array of checklist objects with computed stats
 */
export function transformDbChecklistsToStats(data: any[]): ChecklistWithStats[] {
  return data.map(transformDbChecklistToStats);
}

/**
 * Transforms a single checklist record from the database to a ChecklistWithStats object
 * @param item - Raw checklist data from database
 * @returns A properly typed ChecklistWithStats object
 */
export function transformDbChecklistToStats(item: any): ChecklistWithStats {
  // First ensure the required base fields exist in the object
  const baseChecklist: Checklist = {
    id: item.id,
    title: item.title,
    description: item.description || '',
    is_template: Boolean(item.is_template),
    status: normalizeStatus(item.status),
    category: item.category || '',
    responsible_id: item.responsible_id,
    company_id: item.company_id,
    user_id: item.user_id,
    origin: normalizeOrigin(item.origin)
  };
  
  // Start building the enhanced ChecklistWithStats object
  const result: ChecklistWithStats = {
    ...baseChecklist,
    totalQuestions: item.totalQuestions || 0,
    completedQuestions: item.completedQuestions || 0,
    companyName: item.companyName || getCompanyName(item),
    responsibleName: item.responsibleName || getResponsibleName(item)
  };
  
  // Apply mappings for backward compatibility
  for (const mapping of FIELD_MAPPINGS) {
    if (mapping.source in item) {
      // Use type assertion to overcome TypeScript's type checking here
      // since we're dynamically setting properties based on mapping
      (result as any)[mapping.target] = item[mapping.source];
    }
  }

  return result;
}

/**
 * Normalizes the status field to ensure it conforms to the required type
 */
function normalizeStatus(status: any): "active" | "inactive" {
  return status === 'active' ? 'active' : 'inactive';
}

/**
 * Normalizes the origin field to ensure it conforms to the required type
 */
function normalizeOrigin(origin: any): ChecklistOrigin {
  if (origin === 'ia' || origin === 'csv') {
    return origin;
  }
  return 'manual';
}

/**
 * Extracts company name from various possible locations in the data
 */
function getCompanyName(item: any): string {
  if (item.companyName) return item.companyName;
  if (item.companies?.fantasy_name) return item.companies.fantasy_name;
  return '';
}

/**
 * Extracts responsible name from various possible locations in the data
 */
function getResponsibleName(item: any): string {
  if (item.responsibleName) return item.responsibleName;
  if (item.users?.name) return item.users.name;
  return '';
}
