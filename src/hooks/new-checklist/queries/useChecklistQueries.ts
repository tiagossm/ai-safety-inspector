
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChecklistWithStats } from '@/types/newChecklist';

/**
 * Hook for fetching multiple checklists with query parameters
 */
export const useChecklistsQuery = (options?: {
  filters?: any;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['checklists', options?.filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name),
          users:responsible_id (id, name)
        `);
        
      if (error) throw error;
      
      // Transform the data to match the ChecklistWithStats interface
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        is_template: item.is_template || false,
        isTemplate: item.is_template || false,
        status: item.status || 'active',
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
        origin: item.origin || 'manual',
        parent_question_id: item.parent_question_id,
        parentQuestionId: item.parent_question_id,
        totalQuestions: 0,
        completedQuestions: 0,
        companyName: item.companies?.fantasy_name || '',
        responsibleName: item.users?.name || '',
        theme: item.theme || null
      })) as ChecklistWithStats[];
    },
    enabled: options?.enabled !== false
  });
};

/**
 * Hook for fetching a single checklist by ID
 */
export const useChecklistQuery = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['checklist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name),
          users:responsible_id (id, name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Transform to match ChecklistWithStats interface
      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        is_template: data.is_template || false,
        isTemplate: data.is_template || false,
        status: data.status || 'active',
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
        origin: data.origin || 'manual',
        parent_question_id: data.parent_question_id,
        parentQuestionId: data.parent_question_id,
        totalQuestions: 0, // Would need a separate query to get actual count
        completedQuestions: 0, // Would need a separate query to get actual count
        companyName: data.companies?.fantasy_name || '',
        responsibleName: data.users?.name || '',
        theme: data.theme || null
      } as ChecklistWithStats;
    },
    enabled: !!id && options?.enabled !== false
  });
};
