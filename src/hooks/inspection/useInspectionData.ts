
import { useState, useCallback, useEffect, useMemo } from "react";
import { useInspectionFetch } from "./useInspectionFetch";
import { useResponseHandling, ResponseData } from "./useResponseHandling";
import { useInspectionStatus, Inspection } from "./useInspectionStatus";
import { useQuestionsManagement } from "./useQuestionsManagement";
import { toast } from "sonner";

export interface InspectionDataHook {
  loading: boolean;
  inspection: Inspection | null;
  questions: any[];
  responses: Record<string, ResponseData>;
  groups: any[];
  company: any;
  responsible: any;
  subChecklists: Record<string, any>;
  currentGroupId: string | null;
  setCurrentGroupId: (id: string) => void;
  handleResponseChange: (questionId: string, data: ResponseData) => void;
  handleSaveInspection: () => Promise<any>;
  handleSaveSubChecklistResponses: (subChecklistId: string, responses: Record<string, any>) => Promise<boolean>;
  getCompletionStats: () => any;
  getFilteredQuestions: (groupId: string | null) => any[];
  error: string | null;
  detailedError: any;
  refreshData: () => Promise<void>;
  completeInspection: () => Promise<boolean>;
  reopenInspection: () => Promise<boolean>;
}

export function useInspectionData(inspectionId: string | undefined): InspectionDataHook {
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Carregar dados da inspeção
  const {
    loading,
    error,
    detailedError,
    inspection,
    questions,
    responses,
    groups,
    company,
    responsible,
    subChecklists,
    setResponses,
    refreshData
  } = useInspectionFetch(inspectionId);
  
  // Gerenciamento de questões
  const { 
    getFilteredQuestions: getQuestionsFiltered, 
    getCompletionStats: getStats,
    availableGroups 
  } = useQuestionsManagement(questions, responses);
  
  // Memorizar resultados filtrados para o grupo atual
  const filteredQuestions = useMemo(() => 
    getQuestionsFiltered(currentGroupId),
  [getQuestionsFiltered, currentGroupId]);
  
  // Memorizar estatísticas de conclusão
  const completionStats = useMemo(() => 
    getStats(),
  [getStats]);
  
  // Manipulação de respostas
  const {
    handleResponseChange,
    handleSaveInspection: saveResponses,
    handleSaveSubChecklistResponses
  } = useResponseHandling(inspectionId, setResponses);

  // Gerenciamento de status da inspeção
  const { 
    completeInspection: completeInspectionStatus, 
    reopenInspection: reopenInspectionStatus 
  } = useInspectionStatus(inspectionId);
  
  // Definir automaticamente o primeiro grupo quando carregado
  useEffect(() => {
    if (!loading && groups.length > 0 && !currentGroupId) {
      setCurrentGroupId(groups[0].id);
    }
  }, [loading, groups, currentGroupId]);
  
  // Implementar métodos expostos pelo hook
  const getFilteredQuestions = useCallback((groupId: string | null) => {
    return getQuestionsFiltered(groupId);
  }, [getQuestionsFiltered]);
  
  const getCompletionStats = useCallback(() => {
    return completionStats;
  }, [completionStats]);
  
  // Salvar inspeção
  const handleSaveInspection = async () => {
    if (!inspection) return;
    
    try {
      setSaving(true);
      const updatedInspection = await saveResponses(responses, inspection);
      toast.success("Progresso salvo com sucesso");
      return updatedInspection;
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message || "Erro desconhecido"}`);
      throw error;
    } finally {
      setSaving(false);
    }
  };
  
  // Completar inspeção
  const completeInspection = async () => {
    if (!inspection) return false;
    
    try {
      setSaving(true);
      await saveResponses(responses, inspection);
      
      const updatedInspection = await completeInspectionStatus(inspection);
      
      if (!updatedInspection) {
        throw new Error("Falha ao completar inspeção.");
      }
      
      await refreshData();
      return true;
    } catch (error: any) {
      toast.error(`Erro ao finalizar inspeção: ${error.message || "Erro desconhecido"}`);
      throw error;
    } finally {
      setSaving(false);
    }
  };
  
  // Reabrir inspeção
  const reopenInspection = async () => {
    if (!inspection) return false;
    
    try {
      setSaving(true);
      const updatedInspection = await reopenInspectionStatus(inspection);
      
      if (!updatedInspection) {
        throw new Error("Falha ao reabrir inspeção.");
      }
      
      await refreshData();
      return true;
    } catch (error: any) {
      toast.error(`Erro ao reabrir inspeção: ${error.message || "Erro desconhecido"}`);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    inspection,
    questions,
    responses,
    groups,
    company,
    responsible,
    subChecklists,
    currentGroupId,
    setCurrentGroupId,
    handleResponseChange,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    getCompletionStats,
    getFilteredQuestions,
    error,
    detailedError,
    refreshData,
    completeInspection,
    reopenInspection
  };
}
