
import { useState, useEffect, useCallback } from "react";
import { fetchInspectionData } from "@/services/inspection/inspectionFetchService";
import { toast } from "sonner";

export function useSimpleInspection(inspectionId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  
  // Busca os dados da inspeção
  const fetchData = useCallback(async () => {
    if (!inspectionId) {
      setError("ID da inspeção não fornecido");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching inspection data for ID: ${inspectionId}`);
      const data = await fetchInspectionData(inspectionId);
      
      if (data.error) {
        setError(data.error);
      } else {
        setInspection(data.inspection);
        setQuestions(data.questions);
        setGroups(data.groups);
        setResponses(data.responses);
        setCompany(data.company);
        setResponsible(data.responsible);
        
        // Definir o grupo inicial se não estiver definido
        if (data.groups && data.groups.length > 0 && !currentGroupId) {
          setCurrentGroupId(data.groups[0].id);
        }
      }
    } catch (err: any) {
      console.error("Error in useSimpleInspection:", err);
      setError(err.message || "Erro desconhecido");
      toast.error(`Erro ao carregar dados da inspeção: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [inspectionId, currentGroupId]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Obtém as perguntas filtradas pelo grupo atual
  const getFilteredQuestions = useCallback(() => {
    if (!questions || questions.length === 0) {
      return [];
    }
    
    if (!currentGroupId) {
      return questions;
    }
    
    return questions.filter(q => q.groupId === currentGroupId);
  }, [questions, currentGroupId]);

  // Calcula estatísticas de conclusão
  const getCompletionStats = useCallback(() => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(responses).length;
    const completionPercentage = totalQuestions > 0 
      ? Math.round((answeredQuestions / totalQuestions) * 100) 
      : 0;
    
    return {
      totalQuestions,
      answeredQuestions,
      completionPercentage
    };
  }, [questions, responses]);

  // Manipular mudança de resposta
  const handleResponseChange = useCallback((questionId: string, data: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...data
      }
    }));
  }, []);

  // Salvar inspeção
  const saveInspection = useCallback(async () => {
    // Implementação simplificada para focar no problema de exibição
    toast.success("Salvamento será implementado em breve");
    return Promise.resolve();
  }, []);

  return {
    loading,
    error,
    inspection,
    questions,
    groups,
    responses,
    company,
    responsible,
    currentGroupId,
    setCurrentGroupId,
    filteredQuestions: getFilteredQuestions(),
    stats: getCompletionStats(),
    handleResponseChange,
    saveInspection,
    refreshData: fetchData
  };
}
