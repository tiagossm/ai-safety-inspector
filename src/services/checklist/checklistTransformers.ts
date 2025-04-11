
import { ChecklistWithStats } from "@/types/newChecklist";

export const transformChecklists = (data: any[]) => {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isTemplate: item.is_template,
    is_template: item.is_template, // Include both properties
    status: item.status,
    category: item.category,
    responsibleId: item.responsible_id,
    companyId: item.company_id,
    userId: item.user_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    dueDate: item.due_date,
    isSubChecklist: item.is_sub_checklist,
    origin: item.origin,
    theme: item.theme,
    totalQuestions: item.total_questions || 0,
    completedQuestions: item.completed_questions || 0,
    companyName: item.companies?.fantasy_name,
    responsibleName: item.responsible?.name || item.responsibleName || ""
  })) as ChecklistWithStats[];
};

export const transformChecklistsStats = (data: any[]) => {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isTemplate: item.is_template,
    is_template: item.is_template, // Include both properties
    status: item.status,
    isSubChecklist: item.is_sub_checklist,
    category: item.category,
    companyId: item.company_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    origin: item.origin,
    totalQuestions: item.total_questions || 0,
    completedQuestions: item.completed_questions || 0,
    companyName: item.company_name,
    responsibleName: item.responsible_name
  })) as ChecklistWithStats[];
};

/**
 * Safely transforms a raw database response to a ChecklistWithStats object
 */
export const transformResponseToChecklistWithStats = (item: any): ChecklistWithStats => {
  // Extract responsible name safely using the new property name from Supabase query
  let responsibleName = item.responsibleName || "";
  
  if (!responsibleName && item.responsible && typeof item.responsible === 'object') {
    responsibleName = item.responsible.name || "";
  }
  
  return {
    id: item.id,
    title: item.title,
    description: item.description || "",
    isTemplate: item.is_template,
    is_template: item.is_template, // Include both for compatibility
    status: item.status || "active",
    category: item.category || "",
    origin: item.origin || "manual",
    responsibleId: item.responsible_id || "",
    companyId: item.company_id || "",
    userId: item.user_id || "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    dueDate: item.due_date,
    isSubChecklist: item.is_sub_checklist || false,
    totalQuestions: 0, // We'll need another query to get this info
    companyName: item.companies?.fantasy_name || "",
    responsibleName: responsibleName,
  };
};
