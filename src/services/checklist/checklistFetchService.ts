
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistOrigin } from "@/types/newChecklist";
import { transformDbChecklistsToStats } from "./checklistTransformers";

export const checklistFetchService = {
  fetchChecklists: async (): Promise<ChecklistWithStats[]> => {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch users separately to avoid join errors
      const userIds = data
        .filter(item => item.user_id)
        .map(item => item.user_id);
      
      let userMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name')
          .in('id', userIds);
          
        if (!userError && userData) {
          userMap = userData.reduce((acc: Record<string, string>, user: any) => {
            acc[user.id] = user.name || '';
            return acc;
          }, {});
        }
      }
      
      // Transform data to match the expected format
      const checklists: ChecklistWithStats[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        is_template: item.is_template || false,
        isTemplate: item.is_template || false,
        status: item.status === 'active' ? 'active' : 'inactive' as "active" | "inactive",
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
        parentQuestionId: item.parent_question_id, // Add missing property
        totalQuestions: 0,
        completedQuestions: 0,
        companyName: item.companies?.fantasy_name || '',
        responsibleName: item.user_id ? userMap[item.user_id] || '' : ''
      }));
      
      return checklists;
    } catch (error) {
      console.error("Error fetching checklists:", error);
      return [];
    }
  },

  fetchChecklistById: async (id: string): Promise<ChecklistWithStats> => {
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }

      // Fetch user data separately
      let responsibleName = '';
      if (data.user_id) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name')
          .eq('id', data.user_id)
          .single();
          
        if (!userError && userData) {
          responsibleName = userData.name || '';
        }
      }

      // TypeScript safeguards for enum types
      const statusValue = data.status === 'active' ? 'active' : 'inactive' as "active" | "inactive";
      const originValue = (data.origin || 'manual') as ChecklistOrigin;

      // Return formatted data
      const checklist: ChecklistWithStats = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        is_template: data.is_template || false,
        isTemplate: data.is_template || false,
        status: statusValue,
        category: data.category || '',
        responsible_id: data.responsible_id,
        responsibleId: data.responsible_id,
        company_id: data.company_id,
        companyId: data.company_id,
        user_id: data.user_id,
        userId: data.user_id,
        created_at: data.created_at,
        createdAt: data.created_at,
        updated_at: data.updated_at,
        updatedAt: data.updated_at,
        due_date: data.due_date,
        dueDate: data.due_date,
        is_sub_checklist: data.is_sub_checklist || false,
        isSubChecklist: data.is_sub_checklist || false,
        origin: originValue,
        parent_question_id: data.parent_question_id,
        parentQuestionId: data.parent_question_id, // Add missing property
        totalQuestions: 0,
        completedQuestions: 0,
        companyName: data.companies?.fantasy_name || '',
        responsibleName: responsibleName
      };
      
      return checklist;
    } catch (error) {
      console.error("Error fetching checklist by ID:", error);
      throw error;
    }
  },

  fetchCompanyNameById: async (companyId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('fantasy_name')
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      return data?.fantasy_name || null;
    } catch (error) {
      console.error("Error fetching company name:", error);
      return null;
    }
  }
};
