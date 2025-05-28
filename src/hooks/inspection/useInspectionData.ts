import { useState, useCallback, useEffect } from "react";
import { useInspectionFetch } from "./useInspectionFetch";
import { useInspectionStatus } from "./useInspectionStatus";
import { useResponseHandling } from "./useResponseHandling";
import { useActionPlans } from "./useActionPlans";
import { 
  Inspection, 
  InspectionResponse, 
  ActionPlan, 
  InspectionSignature 
} from "@/types/inspection";
import { handleInspectionError } from "@/utils/inspection/errorHandling";
import { toast } from "sonner";

/**
 * Interface para retorno do hook
 */
interface UseInspectionDataReturn {
  // Dados
  inspection: Inspection | null;
  responses: Record<string, any>;
  questions: any[];
  company: any;
  responsible: any;
  actionPlans: ActionPlan[];
  signatures: InspectionSignature[];
  
  // Estados
  loading: boolean;
  saving: boolean;
  error: any;
  
  // Funções
  handleResponseChange: (questionId: string, data: any) => void;
  handleMediaChange: (questionId: string, mediaUrls: string[]) => void;
  handleMediaUpload: (file: File, questionId: string) => Promise<string>;
  saveInspection: () => Promise<boolean>;
  completeInspection: () => Promise<void>;
  reopenInspection: () => Promise<void>;
  refreshData: () => void;
  
  // Estatísticas
  stats: {
    totalQuestions: number;
    answeredQuestions: number;
    completionPercentage: number;
    actionPlansCount: number;
    pendingActionPlans: number;
  };
}

/**
 * Hook para gerenciar dados de inspeção
 * @param inspectionId ID da inspeção
 * @returns Objeto com dados e funções para manipular a inspeção
 */
export function useInspectionData(inspectionId: string | undefined): UseInspectionDataReturn {
  // Buscar dados da inspeção
  const {
    inspection,
    questions,
    responses: initialResponses,
    company,
    responsible,
    loading: fetchLoading,
    error: fetchError,
    refreshData: refreshInspectionData
  } = useInspectionFetch(inspectionId);
  
  // Estado local para respostas
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  // Atualizar respostas quando os dados iniciais mudarem
  useEffect(() => {
    if (initialResponses) {
      setResponses(initialResponses);
    }
  }, [initialResponses]);
  
  // Gerenciamento de status da inspeção
  const { completeInspection: completeInspectionStatus, reopenInspection: reopenInspectionStatus } = useInspectionStatus(inspectionId);
  
  // Gerenciamento de respostas
  const {
    handleResponseChange,
    handleMediaChange,
    handleMediaUpload,
    handleSaveInspection,
    isSaving
  } = useResponseHandling(inspectionId, setResponses);
  
  // Gerenciamento de planos de ação
  const { plans: actionPlans, loading: plansLoading, stats: actionPlanStats } = useActionPlans(inspectionId);
  
  // Buscar assinaturas
  const [signatures, setSignatures] = useState<InspectionSignature[]>([]);
  
  // Buscar assinaturas da inspeção
  const fetchSignatures = useCallback(async () => {
    if (!inspectionId) return;
    
    try {
      const { data, error } = await fetch(`/api/inspections/${inspectionId}/signatures`).then(res => res.json());
      
      if (error) throw error;
      setSignatures(data || []);
    } catch (error) {
      console.error("Erro ao buscar assinaturas:", error);
    }
  }, [inspectionId]);
  
  // Buscar assinaturas ao carregar
  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures]);
  
  // Calcular estatísticas
  const stats = {
    totalQuestions: questions?.length || 0,
    answeredQuestions: Object.keys(responses || {}).length,
    completionPercentage: questions?.length 
      ? Math.round((Object.keys(responses || {}).length / questions.length) * 100) 
      : 0,
    actionPlansCount: actionPlans?.length || 0,
    pendingActionPlans: actionPlans?.filter(p => p.status === 'pending').length || 0
  };
  
  // Função para salvar inspeção
  const saveInspection = useCallback(async (): Promise<boolean> => {
    if (!inspection) return false;
    
    try {
      await handleSaveInspection(responses, inspection);
      toast.success("Inspeção salva com sucesso");
      return true;
    } catch (error) {
      handleInspectionError(error, "saveInspection");
      return false;
    }
  }, [responses, inspection, handleSaveInspection]);
  
  // Função para completar inspeção
  const completeInspectionHandler = useCallback(async (): Promise<void> => {
    if (!inspection) return;
    
    try {
      // Primeiro salvar as respostas atuais
      await saveInspection();
      
      // Completar a inspeção
      await completeInspectionStatus(inspection);
      
      toast.success("Inspeção concluída com sucesso");
      
      // Atualizar dados
      refreshInspectionData();
    } catch (error) {
      handleInspectionError(error, "completeInspection");
    }
  }, [inspection, saveInspection, completeInspectionStatus, refreshInspectionData]);
  
  // Função para reabrir inspeção
  const reopenInspectionHandler = useCallback(async (): Promise<void> => {
    if (!inspection) return;
    
    try {
      // Reabrir a inspeção
      await reopenInspectionStatus(inspection);
      
      toast.success("Inspeção reaberta com sucesso");
      
      // Atualizar dados
      refreshInspectionData();
    } catch (error) {
      handleInspectionError(error, "reopenInspection");
    }
  }, [inspection, reopenInspectionStatus, refreshInspectionData]);
  
  // Determinar estado de carregamento
  const loading = fetchLoading || plansLoading;
  
  // Determinar erro
  const error = fetchError;
  
  return {
    // Dados
    inspection,
    responses,
    questions,
    company,
    responsible,
    actionPlans,
    signatures,
    
    // Estados
    loading,
    saving: isSaving,
    error,
    
    // Funções
    handleResponseChange,
    handleMediaChange,
    handleMediaUpload,
    saveInspection,
    completeInspection: completeInspectionHandler,
    reopenInspection: reopenInspectionHandler,
    refreshData: refreshInspectionData,
    
    // Estatísticas
    stats
  };
}

