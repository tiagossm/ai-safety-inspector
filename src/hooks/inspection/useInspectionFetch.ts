import { useState, useEffect, useCallback } from "react";
import { fetchInspectionData } from "@/services/inspection/inspectionFetchService";
import { toast } from "sonner";

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
  const [fetchAttempted, setFetchAttempted] = useState(false);

  const fetchData = useCallback(async () => {
    if (!inspectionId || fetchAttempted) return;

    setFetchAttempted(true);
    setLoading(true);
    setError(null);
    setDetailedError(null);

    try {
      const data = await fetchInspectionData(inspectionId);

      if (!data || typeof data !== "object") throw new Error("Dados inválidos recebidos");
      if (data.error) throw new Error(data.error);

      setInspection(data.inspection || null);
      setQuestions((data.questions || []).map((q: any) => ({
        ...q,
        groupId: q.groupId || "default-group"
      })));
      setGroups((data.groups && data.groups.length > 0) ? data.groups : [{ id: "default-group", title: "Geral", order: 0 }]);
      setResponses(data.responses || {});
      setCompany(data.company || null);
      setResponsible(data.responsible || null);
      setSubChecklists(data.subChecklists || {});
    } catch (err: any) {
      console.error("Erro ao buscar dados da inspeção:", err);
      const msg = err?.message || "Erro desconhecido";
      setError(msg);
      setDetailedError(err);
      toast.error(`Erro ao carregar inspeção: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [inspectionId, fetchAttempted]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
