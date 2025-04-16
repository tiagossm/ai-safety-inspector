
import { useState, useEffect, useCallback } from "react";
import { fetchInspectionData } from "@/services/inspection/inspectionFetchService";

export function useInspectionFetch(inspectionId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  const [subChecklists, setSubChecklists] = useState<Record<string, any>>({});

  const fetchData = useCallback(async () => {
    if (!inspectionId) {
      setError("ID da inspeção não fornecido");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setDetailedError(null);

    const data = await fetchInspectionData(inspectionId);
    
    setError(data.error);
    setDetailedError(data.detailedError);
    setInspection(data.inspection);
    setQuestions(data.questions);
    setGroups(data.groups);
    setResponses(data.responses);
    setCompany(data.company);
    setResponsible(data.responsible);
    setSubChecklists(data.subChecklists);
    setLoading(false);
  }, [inspectionId]);

  useEffect(() => {
    if (inspectionId) {
      fetchData();
    } else {
      setLoading(false);
      setGroups([]);
      setQuestions([]);
      setResponses({});
      setSubChecklists({});
    }
  }, [fetchData, inspectionId]);

  useEffect(() => {
    // Debug logging after data loading
    if (!loading) {
      console.log(`Finished loading inspection data. Questions count: ${questions.length}, Groups count: ${groups.length}`);
      if (questions.length === 0) {
        console.warn("No questions loaded, this might be a problem!");
      }
      if (groups.length === 0) {
        console.warn("No groups loaded, will use default group");
      }
    }
  }, [loading, questions, groups]);

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
    refreshData: fetchData,
  };
}
