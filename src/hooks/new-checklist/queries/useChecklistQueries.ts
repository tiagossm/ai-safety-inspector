import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistOrigin } from "@/types/newChecklist";

// Helper function to transform the database results into our expected format
const transformChecklistData = (data: any[]): ChecklistWithStats[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    id: item.id,
    title: item.title || '',
    description: item.description || '',
    isTemplate: item.is_template || false,
    status: item.status || 'active',
    category: item.category || '',
    theme: item.theme || item.category || '', // Add theme property with fallback to category
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
    origin: (item.origin as ChecklistOrigin) || 'manual',
    parent_question_id: item.parent_question_id,
    parentQuestionId: item.parent_question_id,
    totalQuestions: 0,
    completedQuestions: 0,
    companyName: item.companies?.fantasy_name || '',
    responsibleName: item.responsible?.name || '' // Use responsible instead of users
  }));
};

export const useAllChecklists = () => {
  return useQuery({
    queryKey: ['checklists', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name),
          responsible:responsible_id (id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching checklists:", error);
        throw new Error(error.message);
      }
      
      return transformChecklistData(data);
    }
  });
};

export const useTemplateChecklists = () => {
  return useQuery({
    queryKey: ['checklists', 'templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name),
          responsible:responsible_id (id, name)
        `)
        .eq('is_template', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching checklist templates:", error);
        throw new Error(error.message);
      }
      
      return transformChecklistData(data);
    }
  });
};

export const useActiveChecklists = () => {
  return useQuery({
    queryKey: ['checklists', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name),
          responsible:responsible_id (id, name)
        `)
        .eq('is_template', false)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching active checklists:", error);
        throw new Error(error.message);
      }
      
      return transformChecklistData(data);
    }
  });
};

export const useInactiveChecklists = () => {
  return useQuery({
    queryKey: ['checklists', 'inactive'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name),
          responsible:responsible_id (id, name)
        `)
        .eq('is_template', false)
        .eq('status', 'inactive')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching inactive checklists:", error);
        throw new Error(error.message);
      }
      
      return transformChecklistData(data);
    }
  });
};
