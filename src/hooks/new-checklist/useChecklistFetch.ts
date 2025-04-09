
// This file will be replaced by our more focused hooks
import { useState, useEffect } from 'react';
import { ChecklistWithStats } from '@/types/newChecklist';
import { fetchAllChecklistsData } from './queries/useChecklistQueries';

/**
 * @deprecated Use useChecklistsQuery instead
 * Legacy hook for fetching checklists without React Query
 */
export function useChecklistFetch() {
  const [checklists, setChecklists] = useState<ChecklistWithStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const data = await fetchAllChecklistsData();
      setChecklists(data);
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
