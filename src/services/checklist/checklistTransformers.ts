
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
    status: item.status,
    isSubChecklist: item.is_sub_checklist,
    category: item.category,
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
