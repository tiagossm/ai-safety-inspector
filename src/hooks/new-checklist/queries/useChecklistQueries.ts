
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistOrigin } from "@/types/newChecklist";

// Helper function to transform the database results into our expected format
const transformChecklistData = (data: any[]): ChecklistWithStats[] => {
  return data.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    is_template: item.is_template || false,
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
    origin: item.origin as ChecklistOrigin || 'manual',
    parent_question_id: item.parent_question_id,
    parentQuestionId: item.parent_question_id,
    totalQuestions: 0,
    completedQuestions: 0,
    companyName: item.companies?.fantasy_name || '',
    responsibleName: item.responsible?.name || '' // Use responsible instead of users
  }));
};

export const fetchChecklists = async (): Promise<ChecklistWithStats[]> => {
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
    throw error;
  }
  
  return transformChecklistData(data || []);
};

export const fetchAllChecklistsData = async (): Promise<ChecklistWithStats[]> => {
  const checklists = await fetchChecklists();
  
  // Get question counts for each checklist
  const checklistIds = checklists.map(c => c.id);
  const questionsCountPromises = checklistIds.map((id: string) => 
    supabase
      .from('checklist_itens')
      .select('*', { count: 'exact', head: true })
      .eq('checklist_id', id)
  );
  
  const questionsCountResults = await Promise.all(questionsCountPromises);
  
  // Add question counts to checklists
  return checklists.map((checklist, index) => ({
    ...checklist,
    totalQuestions: questionsCountResults[index].count || 0
  }));
};

export function useChecklistsQuery() {
  return useQuery({
    queryKey: ['checklists'],
    queryFn: fetchAllChecklistsData
  });
}

export function useChecklistQuery(id: string) {
  return useQuery({
    queryKey: ['checklist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name),
          responsible:responsible_id (id, name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Get questions for this checklist
      const { data: questions, error: questionsError } = await supabase
        .from('checklist_itens')
        .select('*')
        .eq('checklist_id', id)
        .order('ordem', { ascending: true });
      
      if (questionsError) throw questionsError;
      
      const checklist = transformChecklistData([data])[0];
      checklist.totalQuestions = questions ? questions.length : 0;
      
      return checklist;
    },
    enabled: !!id
  });
}
