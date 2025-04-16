
import { useState, useEffect, useCallback } from "react";
import { fetchInspectionData } from "@/services/inspection/inspectionFetchService";
import { toast } from "sonner";

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

    try {
      console.log(`Fetching inspection data for ID: ${inspectionId}`);
      const data = await fetchInspectionData(inspectionId);
      
      setError(data.error);
      setDetailedError(data.detailedError);
      setInspection(data.inspection);
      
      // If there are questions, make sure they all have valid groupIds
      if (data.questions && data.questions.length > 0) {
        const normalizedQuestions = data.questions.map((q: any) => ({
          ...q,
          groupId: q.groupId || "default-group" 
        }));
        setQuestions(normalizedQuestions);
        console.log(`Loaded ${normalizedQuestions.length} questions with normalized groupIds`);
      } else {
        setQuestions([]);
        console.warn("No questions loaded for this inspection");
      }
      
      if (data.groups && data.groups.length > 0) {
        setGroups(data.groups);
        console.log(`Loaded ${data.groups.length} groups`);
      } else {
        // Always ensure there's at least a default group
        setGroups([{ id: "default-group", title: "Geral", order: 0 }]);
        console.warn("No groups loaded, using default group");
      }
      
      setResponses(data.responses || {});
      setCompany(data.company);
      setResponsible(data.responsible);
      setSubChecklists(data.subChecklists || {});
    } catch (err: any) {
      console.error("Error in useInspectionFetch:", err);
      setError(err.message || "Erro desconhecido");
      toast.error(`Erro ao carregar dados da inspeção: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    if (inspectionId) {
      fetchData();
    } else {
      setLoading(false);
      setGroups([{ id: "default-group", title: "Geral", order: 0 }]);
      setQuestions([]);
      setResponses({});
      setSubChecklists({});
    }
  }, [fetchData, inspectionId]);

  // Debug logging
  useEffect(() => {
    if (!loading) {
      console.log(`Finished loading inspection data. Questions count: ${questions.length}, Groups count: ${groups.length}`);
      
      if (questions.length === 0) {
        console.warn("No questions loaded, this might be a problem!");
      }
      
      if (groups.length === 0) {
        console.warn("No groups loaded, will use default group");
      }
    }
  }, [loading, questions.length, groups.length]);

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
