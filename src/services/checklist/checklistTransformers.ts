
import { ChecklistWithStats, ChecklistOrigin } from "@/types/newChecklist";

export function transformDbChecklistsToStats(data: any[]): ChecklistWithStats[] {
  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    is_template: item.is_template || false,
    isTemplate: item.is_template || false,
    status: item.status === 'active' ? 'active' : 'inactive',
    category: item.category || '',
    responsible_id: item.responsible_id,
    responsibleId: item.responsible_id,
    company_id: item.company_id,
    companyId: item.company_id,
    user_id: item.user_id,
    userId: item.user_id,
    created_at: item.created_at,
    createdAt: item.created_at,
    updated_at: item.updated_at,
    updatedAt: item.updated_at,
    due_date: item.due_date,
    dueDate: item.due_date,
    is_sub_checklist: item.is_sub_checklist || false,
    isSubChecklist: item.is_sub_checklist || false,
    origin: (item.origin || 'manual') as ChecklistOrigin,
    parent_question_id: item.parent_question_id,
    parentQuestionId: item.parent_question_id,
    totalQuestions: item.totalQuestions || 0,
    completedQuestions: item.completedQuestions || 0,
    companyName: item.companyName || item.companies?.fantasy_name || '',
    responsibleName: item.responsibleName || (item.users ? item.users.name || '' : '')
  }));
}

