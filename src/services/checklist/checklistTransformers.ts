
import { ChecklistWithStats } from "@/types/newChecklist";

/**
 * Transforms raw checklist data to the application format
 */
export function transformChecklistData(data: any[]): ChecklistWithStats[] {
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isTemplate: item.is_template,
    is_template: item.is_template, // Add this to match required type
    status: item.status,
    category: item.category,
    theme: item.theme,
    responsibleId: item.responsible_id,
    companyId: item.company_id,
    userId: item.user_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    dueDate: item.due_date,
    isSubChecklist: item.is_sub_checklist,
    origin: item.origin,
    totalQuestions: item.checklist_itens?.[0]?.count || 0,
    completedQuestions: 0,
    companyName: item.companies?.fantasy_name,
    responsibleName: item.users?.name
  }));
}

/**
 * Transforms basic checklist data (without joins)
 */
export function transformBasicChecklistData(data: any[]): ChecklistWithStats[] {
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isTemplate: item.is_template,
    is_template: item.is_template, // Add this to match required type
    status: item.status,
    isSubChecklist: item.is_sub_checklist,
    category: item.category,
    theme: item.theme,
    companyId: item.company_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    origin: item.origin,
    totalQuestions: 0,
    completedQuestions: 0,
    companyName: undefined,
    responsibleName: undefined
  }));
}

// Fix type conversion by adding is_template property
export const transformToChecklistWithStats = (items: any[]): ChecklistWithStats[] => {
  return items.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isTemplate: item.isTemplate || item.is_template,
    is_template: item.isTemplate || item.is_template, // Add this to match required type
    status: item.status,
    category: item.category,
    theme: item.theme,
    responsibleId: item.responsibleId,
    companyId: item.companyId,
    userId: item.userId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    dueDate: item.dueDate,
    isSubChecklist: item.isSubChecklist,
    origin: item.origin,
    totalQuestions: item.totalQuestions || 0,
    completedQuestions: item.completedQuestions || 0,
    companyName: item.companyName,
    responsibleName: item.responsibleName
  }));
};

// Similarly fix the other transformer function
export const transformToChecklistWithStatsCompact = (items: any[]): ChecklistWithStats[] => {
  return items.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    isTemplate: item.isTemplate || item.is_template,
    is_template: item.isTemplate || item.is_template, // Add this to match required type
    status: item.status,
    isSubChecklist: item.isSubChecklist,
    category: item.category,
    theme: item.theme,
    companyId: item.companyId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    origin: item.origin,
    totalQuestions: item.totalQuestions || 0,
    completedQuestions: item.completedQuestions || 0,
    companyName: item.companyName,
    responsibleName: item.responsibleName
  }));
};
