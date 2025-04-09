
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";

export const transformDbChecklistsToStats = (data: any[]): ChecklistWithStats[] => {
  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    is_template: item.isTemplate,
    status: item.status,
    category: item.category,
    responsible_id: item.responsibleId,
    company_id: item.companyId,
    user_id: item.userId,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    due_date: item.dueDate,
    is_sub_checklist: item.isSubChecklist,
    origin: item.origin,
    parent_question_id: item.parentQuestionId,
    totalQuestions: item.totalQuestions || 0,
    completedQuestions: item.completedQuestions || 0,
    companyName: item.companyName,
    responsibleName: item.responsibleName,
    // For backward compatibility
    isTemplate: item.isTemplate,
    isSubChecklist: item.isSubChecklist,
    companyId: item.companyId,
    responsibleId: item.responsibleId,
    userId: item.userId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    dueDate: item.dueDate
  }));
};

export const transformChecklistsForUI = (data: any[]): ChecklistWithStats[] => {
  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    is_template: item.isTemplate,
    status: item.status,
    is_sub_checklist: item.isSubChecklist,
    category: item.category,
    company_id: item.companyId,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    origin: item.origin,
    totalQuestions: item.totalQuestions || 0,
    completedQuestions: item.completedQuestions || 0,
    companyName: item.companyName,
    responsibleName: item.responsibleName,
    // For backward compatibility
    isTemplate: item.isTemplate,
    isSubChecklist: item.isSubChecklist,
    companyId: item.companyId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));
};
