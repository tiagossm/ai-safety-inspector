
import { useState, useEffect, useCallback } from "react";
import { fetchInspectionData } from "@/services/inspection/inspectionFetchService";

export function useInspectionFetch(inspectionId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  const [responsibles, setResponsibles] = useState<any[]>([]);
  const [subChecklists, setSubChecklists] = useState<Record<string, any>>({});

  const fetchData = useCallback(async () => {
    if (!inspectionId) {
      setLoading(false);
      setError("ID da inspeção não fornecido");
      return;
    }

    try {
      setLoading(true);
      
      console.log(`Fetching inspection data for ID: ${inspectionId}`);
      
      const result = await fetchInspectionData(inspectionId);
      
      if (result.error) {
        console.error("Error fetching inspection:", result.error);
        setError(result.error);
        setDetailedError(result.detailedError);
        return;
      }
      
      console.log("Successfully loaded inspection data:", {
        questions: result.questions?.length || 0,
        responses: Object.keys(result.responses || {}).length || 0,
        groups: result.groups?.length || 0
      });
      
      setInspection(result.inspection);
      setQuestions(result.questions || []);
      setGroups(result.groups || []);
      setResponses(result.responses || {});
      setCompany(result.company);
      setResponsible(result.responsible);
      setResponsibles(result.responsibles || []);
      setSubChecklists(result.subChecklists || {});
      setError(null);
      setDetailedError(null);
    } catch (err: any) {
      console.error("Error in useInspectionFetch:", err);
      setError(err.message || "Erro ao carregar inspeção");
      setDetailedError(err);
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, inspectionId]);

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
    responsibles,
    subChecklists,
    setResponses,
    refreshData,
  };
}
