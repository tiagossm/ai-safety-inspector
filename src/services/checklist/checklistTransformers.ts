
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistOrigin } from "@/types/newChecklist";

export const transformDbChecklistsToStats = (data: any[]): ChecklistWithStats[] => {
  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    is_template: item.isTemplate || item.is_template || false,
    status: item.status,
    category: item.category,
    responsible_id: item.responsibleId || item.responsible_id,
    company_id: item.companyId || item.company_id,
    user_id: item.userId || item.user_id,
    created_at: item.createdAt || item.created_at,
    updated_at: item.updatedAt || item.updated_at,
    due_date: item.dueDate || item.due_date,
    is_sub_checklist: item.isSubChecklist || item.is_sub_checklist || false,
    origin: (item.origin || 'manual') as ChecklistOrigin,
    parent_question_id: item.parentQuestionId || item.parent_question_id,
    totalQuestions: item.totalQuestions || 0,
    completedQuestions: item.completedQuestions || 0,
    companyName: item.companyName,
    responsibleName: item.responsibleName,
    // For backward compatibility
    isTemplate: item.isTemplate || item.is_template || false,
    isSubChecklist: item.isSubChecklist || item.is_sub_checklist || false,
    companyId: item.companyId || item.company_id,
    responsibleId: item.responsibleId || item.responsible_id,
    userId: item.userId || item.user_id,
    createdAt: item.createdAt || item.created_at,
    updatedAt: item.updatedAt || item.updated_at,
    dueDate: item.dueDate || item.due_date
  }));
};

export const transformChecklistsForUI = (data: any[]): ChecklistWithStats[] => {
  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    is_template: item.isTemplate || item.is_template || false,
    status: item.status,
    is_sub_checklist: item.isSubChecklist || item.is_sub_checklist || false,
    category: item.category,
    company_id: item.companyId || item.company_id,
    created_at: item.createdAt || item.created_at,
    updated_at: item.updatedAt || item.updated_at,
    origin: (item.origin || 'manual') as ChecklistOrigin,
    totalQuestions: item.totalQuestions || 0,
    completedQuestions: item.completedQuestions || 0,
    companyName: item.companyName,
    responsibleName: item.responsibleName,
    responsible_id: item.responsibleId || item.responsible_id,
    user_id: item.userId || item.user_id,
    due_date: item.dueDate || item.due_date,
    parent_question_id: item.parentQuestionId || item.parent_question_id,
    // For backward compatibility
    isTemplate: item.isTemplate || item.is_template || false,
    isSubChecklist: item.isSubChecklist || item.is_sub_checklist || false,
    companyId: item.companyId || item.company_id,
    responsibleId: item.responsibleId || item.responsible_id,
    userId: item.userId || item.user_id,
    createdAt: item.createdAt || item.created_at,
    updatedAt: item.updatedAt || item.updated_at,
    dueDate: item.dueDate || item.due_date
  }));
};
