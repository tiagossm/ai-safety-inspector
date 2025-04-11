
import { useState, useEffect } from "react";
import { ChecklistWithStats } from "@/types/newChecklist";
import { fetchChecklistData } from "./utils/checklistDataFetcher";

interface UseChecklistByIdResult {
  data: ChecklistWithStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a specific checklist by ID with all related data
 */
export function useChecklistById(id: string): UseChecklistByIdResult {
  const [data, setData] = useState<ChecklistWithStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    
    const { checklistData, error } = await fetchChecklistData(id);
    
    if (error) {
      setError(error);
    } else {
      setData(checklistData);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, loading, error, refetch: fetchData };
}
