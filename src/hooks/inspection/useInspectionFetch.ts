
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchInspectionData } from "@/services/inspection/inspectionFetchService";

export function useInspectionFetch(inspectionId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([{ id: "default-group", title: "Geral", order: 0 }]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  const [subChecklists, setSubChecklists] = useState<Record<string, any>>({});

  const fetchAttemptedRef = useRef(false); // 🔒 Prevents multiple executions
  const maxRetries = 2;
  const retryRef = useRef(0);

  const fetchData = useCallback(async () => {
    if (!inspectionId) {
      setLoading(false);
      setError("ID da inspeção não fornecido");
      return;
    }

    // Set loading and reset errors
    setLoading(true);
    setError(null);
    setDetailedError(null);
    
    try {
      console.log(`Fetching inspection data for ID: ${inspectionId} (attempt ${retryRef.current + 1})`);
      
      const data = await fetchInspectionData(inspectionId);

      if (!data || typeof data !== "object") throw new Error("Dados inválidos recebidos");
      if (data.error) throw new Error(data.error);

      // Reset fetch attempt tracking - successful fetch
      fetchAttemptedRef.current = true;
      retryRef.current = 0;

      // Set all the data states
      setInspection(data.inspection || null);
      
      // Ensure questions have a groupId
      const processedQuestions = (data.questions || []).map((q: any) => ({
        ...q,
        groupId: q.groupId || "default-group"
      }));
      setQuestions(processedQuestions);
      
      // Ensure we have at least a default group
      setGroups((data.groups && data.groups.length > 0) 
        ? data.groups 
        : [{ id: "default-group", title: "Geral", order: 0 }]);
      
      setResponses(data.responses || {});
      setCompany(data.company || null);
      setResponsible(data.responsible || null);
      setSubChecklists(data.subChecklists || {});
    } catch (err: any) {
      console.error("Error fetching inspection data:", err);
      const msg = err?.message || "Erro desconhecido";
      setError(msg);
      setDetailedError(err);
      
      // No automatic retries - let user manually retry instead
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  // Only fetch on mount or when inspectionId changes
  useEffect(() => {
    // Reset fetch flag when inspectionId changes
    if (inspectionId) {
      fetchAttemptedRef.current = false;
      retryRef.current = 0;
    }

    // Only fetch if we haven't tried already for this inspectionId
    if (inspectionId && !fetchAttemptedRef.current) {
      fetchData();
    }
  }, [inspectionId, fetchData]);

  // Function to manually refresh data
  const refreshData = useCallback(() => {
    if (!inspectionId) return;
    
    // Reset fetch flag to allow retry
    fetchAttemptedRef.current = false;
    retryRef.current = 0;
    fetchData();
  }, [inspectionId, fetchData]);

  return {
    loading,
    error,
    detailedError,
    inspection,
    questions,
    groups,
    responses,
    company,
    responsible,
    subChecklists,
    setResponses,
    refreshData,
  };
}
