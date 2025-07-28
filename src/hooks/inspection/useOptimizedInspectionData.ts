import { useCallback, useMemo } from "react";
import { useInspectionFetch } from "./useInspectionFetch";
import { useInspectionStatus } from "./useInspectionStatus";
import { useQuestionsManagement } from "./useQuestionsManagement";
import { useResponseHandling } from "./useResponseHandling";
import { useAutoSave } from "./useAutoSave";
import { useInspectionMetrics } from "./useInspectionMetrics";
import { Question, InspectionResponse, InspectionFetchResult } from "./types";

interface OptimizedInspectionDataOptions {
  autoSaveEnabled?: boolean;
  autoSaveInterval?: number;
  debounceDelay?: number;
}

export function useOptimizedInspectionData(
  inspectionId: string | undefined,
  options: OptimizedInspectionDataOptions = {}
) {
  // Fetch inspection data
  const inspectionData = useInspectionFetch(inspectionId);
  
  // Status management
  const { completeInspection, reopenInspection } = useInspectionStatus(inspectionId);
  
  // Questions management with optimized filtering
  const {
    getFilteredQuestions,
    getCompletionStats,
    availableGroups,
    handleResponseChange: onQuestionResponseChange
  } = useQuestionsManagement(
    inspectionData.questions as Question[], 
    inspectionData.responses as Record<string, InspectionResponse>, 
    inspectionData.setResponses
  );

  // Response handling (media, uploads, etc.)
  const {
    handleMediaChange,
    handleMediaUpload,
    handleSaveInspection: saveInspection,
    savingResponses
  } = useResponseHandling(inspectionId, inspectionData.setResponses);

  // Auto-save functionality
  const autoSave = useAutoSave(
    inspectionId,
    inspectionData.responses as Record<string, InspectionResponse>,
    {
      enabled: options.autoSaveEnabled ?? true,
      interval: options.autoSaveInterval ?? 30,
      debounceDelay: options.debounceDelay ?? 2000
    }
  );

  // Metrics calculation
  const metrics = useInspectionMetrics(
    inspectionData.questions as Question[],
    inspectionData.responses as Record<string, InspectionResponse>
  );

  // Optimized save function that respects auto-save state
  const handleSaveInspection = useCallback(async (): Promise<void> => {
    if (!inspectionData.inspection) return;
    
    // Save pending auto-save changes first
    if (autoSave.pendingChanges) {
      await autoSave.saveNow();
    }
    
    // Then save the inspection
    await saveInspection(inspectionData.responses, inspectionData.inspection);
  }, [saveInspection, inspectionData.responses, inspectionData.inspection, autoSave]);

  // Memoized completion stats
  const completionStats = useMemo(() => {
    return getCompletionStats();
  }, [getCompletionStats]);

  // Enhanced error handling
  const hasErrors = useMemo(() => {
    return inspectionData.error || autoSave.errorCount > 0;
  }, [inspectionData.error, autoSave.errorCount]);

  // Funcionalidade "Continuar Inspeção" - verificar se há progresso salvo
  const hasProgress = useMemo(() => {
    if (!inspectionData.responses) return false;
    return Object.keys(inspectionData.responses).length > 0;
  }, [inspectionData.responses]);

  // Funcionalidade "Atualizar Dados" - recarregar dados da inspeção
  const updateInspectionData = useCallback(async () => {
    await inspectionData.refreshData();
    // Refresh metrics after data update
    return Promise.resolve();
  }, [inspectionData.refreshData]);

  // Verificar se a inspeção está editável
  const isEditable = useMemo(() => {
    if (!inspectionData.inspection) return false;
    const status = inspectionData.inspection.status?.toLowerCase();
    return ['pendente', 'em andamento', 'pending', 'in_progress', 'aberto'].includes(status);
  }, [inspectionData.inspection]);

  return {
    // Basic inspection data
    ...inspectionData,
    
    // Enhanced functionality
    completeInspection,
    reopenInspection,
    handleResponseChange: onQuestionResponseChange,
    handleMediaUpload,
    handleMediaChange,
    handleSaveInspection,
    updateInspectionData,
    
    // Optimized features
    getFilteredQuestions,
    completionStats,
    availableGroups,
    metrics,
    
    // Auto-save
    autoSave,
    
    // Enhanced state
    savingResponses: savingResponses || autoSave.isSaving,
    hasErrors,
    hasProgress,
    isEditable,
    
    // Utility functions
    refreshData: inspectionData.refreshData
  };
}