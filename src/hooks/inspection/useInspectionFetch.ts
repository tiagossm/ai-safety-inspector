import { useState, useEffect, useCallback } from "react";
import { fetchInspectionData } from "@/services/inspection/inspectionFetchService";
import { toast } from "sonner";

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
      const data = await fetchInspectionData(inspectionId);

      setError(data.error);
      setDetailedError(data.detailedError);
      setInspection(data.inspection);

      if (data.questions && data.questions.length > 0) {
        const normalizedQuestions = data.questions.map((q: any) => ({
          ...q,
          groupId: q.groupId || "default-group"
        }));
        setQuestions(normalizedQuestions);
      } else {
        setQuestions([]);
      }

      if (data.groups && data.groups.length > 0) {
        setGroups(data.groups);
      } else {
        setGroups([{ id: "default-group", title: "Geral", order: 0 }]);
      }

      setResponses(data.responses || {});
      setCompany(data.company);
      setResponsible(data.responsible);
      setSubChecklists(data.subChecklists || {});
    } catch (err: any) {
      console.error("Error in useInspectionFetch:", err);
      setError(err.message || "Erro desconhecido");
      setDetailedError(err);
      toast.error(`Erro ao carregar dados da inspeção: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [inspectionId]); // ✅ Dependência corrigida (sem `groups` para evitar loop infinito)

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
