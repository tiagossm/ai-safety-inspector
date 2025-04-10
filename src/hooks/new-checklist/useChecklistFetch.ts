
import { useState, useEffect } from 'react';
import { ChecklistWithStats } from '@/types/newChecklist';
import { supabase } from '@/integrations/supabase/client';
import { transformDbChecklistsToStats } from '@/services/checklist/checklistTransformers';

/**
 * @deprecated Use useChecklistsQuery instead
 * Legacy hook for fetching checklists without React Query
 */
export function useChecklistFetch() {
  const [checklists, setChecklists] = useState<ChecklistWithStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChecklistsData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const transformedData = transformDbChecklistsToStats(data || []);
      setChecklists(transformedData);
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
    fetchChecklistsData();
  }, []);

  return {
    checklists,
    loading,
    error,
    refetch: fetchChecklistsData
  };
}

export default useChecklistFetch;
