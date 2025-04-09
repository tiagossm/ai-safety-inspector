
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Checklist, ChecklistWithStats, ChecklistOrigin } from '@/types/newChecklist';

export function useChecklistFetch() {
  const [checklists, setChecklists] = useState<ChecklistWithStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name),
          users:user_id (id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get question counts for each checklist
      const checklistIds = data.map((c: any) => c.id);
      const questionsCountPromises = checklistIds.map((id: string) => 
        supabase
          .from('checklist_itens')
          .select('*', { count: 'exact', head: true })
          .eq('checklist_id', id)
      );
      
      const questionsCountResults = await Promise.all(questionsCountPromises);
      const questionCountsMap: Record<string, number> = {};
      
      questionsCountResults.forEach((result, index) => {
        questionCountsMap[checklistIds[index]] = result.count || 0;
      });
      
      // Transform data to match the expected format
      const formattedChecklists: ChecklistWithStats[] = data.map((item: any) => ({
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
        origin: item.origin as ChecklistOrigin || 'manual',
        parent_question_id: item.parent_question_id,
        parentQuestionId: item.parent_question_id,
        totalQuestions: questionCountsMap[item.id] || 0,
        completedQuestions: 0,
        companyName: item.companies?.fantasy_name || '',
        responsibleName: item.users?.name || ''
      }));
      
      setChecklists(formattedChecklists);
      setError(null);
    } catch (err) {
      console.error("Error fetching checklists:", err);
      setError(err as Error);
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchChecklists();
  }, []);

  return {
    checklists,
    loading,
    error,
    refetch: fetchChecklists
  };
}

export default useChecklistFetch;
