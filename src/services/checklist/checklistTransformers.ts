
import { ChecklistWithStats } from "@/types/newChecklist";
import { handleApiError } from "@/utils/errors";

/**
 * Transforms database checklist data to ChecklistWithStats type
 */
export function transformChecklistData(data: any[]): ChecklistWithStats[] {
  if (!data || !Array.isArray(data)) {
    console.error("Invalid data provided to transformChecklistData:", data);
    return [];
  }
  
  try {
    return data.map(item => {
      // Calculate question stats from checklist_itens count
      const totalQuestions = item.checklist_itens?.[0]?.count || 0;
      
      return {
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
        totalQuestions,
        completedQuestions: 0, // This would need to be fetched separately if needed
        companyName: item.companies?.fantasy_name || "Sem empresa",
        responsibleName: item.users?.name || null,
        createdByName: null // This would need to be fetched separately if needed
      };
    });
  } catch (error) {
    handleApiError(error, "Erro ao transformar dados do checklist");
    return [];
  }
}

/**
 * Transforms basic checklist data for client-side filtering
 */
export function transformBasicChecklistData(data: any[]): ChecklistWithStats[] {
  if (!data || !Array.isArray(data)) {
    console.error("Invalid data provided to transformBasicChecklistData:", data);
    return [];
  }
  
  try {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      isTemplate: item.is_template,
      status: item.status,
      category: item.category,
      companyId: item.company_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      isSubChecklist: item.is_sub_checklist,
      origin: item.origin,
      totalQuestions: 0, // Would be populated later if needed
      completedQuestions: 0 // Would be populated later if needed
    }));
  } catch (error) {
    handleApiError(error, "Erro ao transformar dados básicos do checklist");
    return [];
  }
}

/**
 * Extrai e padroniza informações de contagem de questões de um checklist
 */
export function extractQuestionStats(data: any) {
  const totalQuestions = data?.checklist_itens?.[0]?.count || 0;
  return {
    totalQuestions,
    completedQuestions: 0 // Placeholder para implementação futura
  };
}

/**
 * Normaliza informações da empresa em um formato padronizado
 */
export function normalizeCompanyInfo(data: any) {
  return {
    companyId: data?.company_id || null,
    companyName: data?.companies?.fantasy_name || "Sem empresa"
  };
}

/**
 * Normaliza informações do responsável em um formato padronizado
 */
export function normalizeResponsibleInfo(data: any) {
  return {
    responsibleId: data?.responsible_id || null,
    responsibleName: data?.users?.name || null
  };
}
