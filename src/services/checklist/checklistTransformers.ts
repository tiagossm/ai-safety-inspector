
import { ChecklistWithStats, ChecklistOrigin } from "@/types/newChecklist";

export const transformDbChecklistsToStats = (dbChecklists: any[]): ChecklistWithStats[] => {
  return dbChecklists.map(checklist => {
    // Ensure origin is a valid ChecklistOrigin
    const origin: ChecklistOrigin = ['manual', 'ia', 'csv'].includes(checklist.origin) 
      ? checklist.origin as ChecklistOrigin
      : 'manual';
    
    return {
      id: checklist.id,
      title: checklist.title || "",
      description: checklist.description || "",
      is_template: checklist.is_template || false,
      isTemplate: checklist.is_template || false,
      status: checklist.status || "active",
      category: checklist.category || "",
      responsible_id: checklist.responsible_id,
      responsibleId: checklist.responsible_id,
      company_id: checklist.company_id,
      companyId: checklist.company_id,
      user_id: checklist.user_id,
      userId: checklist.user_id,
      created_at: checklist.created_at,
      createdAt: checklist.created_at,
      updated_at: checklist.updated_at,
      updatedAt: checklist.updated_at,
      due_date: checklist.due_date,
      dueDate: checklist.due_date,
      is_sub_checklist: checklist.is_sub_checklist || false,
      isSubChecklist: checklist.is_sub_checklist || false,
      origin: origin,
      parent_question_id: checklist.parent_question_id,
      parentQuestionId: checklist.parent_question_id,
      totalQuestions: checklist.totalQuestions || 0,
      completedQuestions: checklist.completedQuestions || 0,
      companyName: checklist.companies?.fantasy_name || checklist.companyName || null,
      responsibleName: checklist.responsibleName || null,
      questions: checklist.questions || [],
      groups: checklist.groups || []
    };
  });
};
