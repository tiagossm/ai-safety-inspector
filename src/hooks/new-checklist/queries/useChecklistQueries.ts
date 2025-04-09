
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistOrigin } from "@/types/newChecklist";
import { transformDbChecklistsToStats, transformDbChecklistToStats } from "@/services/checklist/checklistTransformers";

/**
 * Fetches all checklists from the database
 */
export const fetchChecklists = async (): Promise<ChecklistWithStats[]> => {
  const { data, error } = await supabase
    .from('checklists')
    .select(`
      *,
      companies:company_id (id, fantasy_name),
      users:user_id (id, name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching checklists:", error);
    throw error;
  }
  
  return transformDbChecklistsToStats(data || []);
};

/**
 * Fetches all checklists with question counts
 */
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

/**
 * Hook to query all checklists with question counts
 */
export function useChecklistsQuery() {
  return useQuery({
    queryKey: ['checklists'],
    queryFn: fetchAllChecklistsData
  });
}

/**
 * Hook to query a specific checklist by ID
 */
export function useChecklistQuery(id: string) {
  return useQuery({
    queryKey: ['checklist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name),
          users:user_id (id, name)
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
      
      const checklist = transformDbChecklistToStats(data);
      checklist.totalQuestions = questions ? questions.length : 0;
      
      return checklist;
    },
    enabled: !!id
  });
}
