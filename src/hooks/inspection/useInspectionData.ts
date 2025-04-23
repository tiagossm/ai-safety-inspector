
import { useState, useCallback, useMemo } from "react";
import { useInspectionFetch } from "./useInspectionFetch";
import { useInspectionStatus } from "./useInspectionStatus";
import { useQuestionsManagement } from "./useQuestionsManagement";
import { useResponseHandling, ResponseData } from "./useResponseHandling";

export interface InspectionDataHook {
  loading: boolean;
  error: string | null;
  detailedError: any;
  inspection: any;
  questions: any[];
  responses: Record<string, ResponseData>;
  groups: any[];
  company: any;
  responsible: any;
  subChecklists: Record<string, any>;
  currentGroupId: string | null;
  handleResponseChange: (questionId: string, value: any, additionalData?: any) => void;
  handleSaveInspection: () => Promise<void>;
  handleSaveSubChecklistResponses: (subChecklistId: string, responses: Record<string, any>) => Promise<void>;
  getCompletionStats: () => { percentage: number; answered: number; total: number; availableGroups?: string[] };
  getFilteredQuestions: (groupId: string | null) => any[];
  refreshData: () => void;
  completeInspection: () => Promise<void>;
  reopenInspection: () => Promise<void>;
  setCurrentGroupId: (id: string) => void;
}

export function useInspectionData(inspectionId: string | undefined): InspectionDataHook {
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  
  // Fetch basic inspection data
  const {
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
  } = useInspectionFetch(inspectionId);

  // Get status management functionality
  const { completeInspection, reopenInspection } = useInspectionStatus(inspectionId);
  
  // Get questions management functionality
  const { getFilteredQuestions, getCompletionStats, availableGroups } = useQuestionsManagement(
    questions || [],
    responses || {}
  );

  // Handle responses and saving
  const { 
    handleResponseChange, 
    saveInspectionResponses, 
    saveSubChecklistResponses 
  } = useResponseHandling(inspectionId, responses, setResponses);

  // Set initial group when data is loaded
  useMemo(() => {
    if (!loading && !currentGroupId && groups && groups.length > 0) {
      setCurrentGroupId(groups[0].id);
    }
  }, [loading, groups, currentGroupId]);

  // Wrap save function
  const handleSaveInspection = useCallback(async () => {
    if (!inspectionId) throw new Error("ID da inspeção não fornecido");
    await saveInspectionResponses();
  }, [inspectionId, saveInspectionResponses]);

  // Wrap subchecklist save function
  const handleSaveSubChecklistResponses = useCallback(async (subChecklistId: string, responses: Record<string, any>) => {
    if (!inspectionId) throw new Error("ID da inspeção não fornecido");
    await saveSubChecklistResponses(subChecklistId, responses);
  }, [inspectionId, saveSubChecklistResponses]);

  // Wrap completeInspection function
  const handleCompleteInspection = useCallback(async () => {
    if (!inspection) throw new Error("Inspeção não carregada");
    // First save current state
    await saveInspectionResponses();
    // Then complete inspection
    return await completeInspection(inspection);
  }, [inspection, saveInspectionResponses, completeInspection]);

  // Wrap reopenInspection function
  const handleReopenInspection = useCallback(async () => {
    if (!inspection) throw new Error("Inspeção não carregada");
    return await reopenInspection(inspection);
  }, [inspection, reopenInspection]);

  return {
    loading,
    error,
    detailedError,
    inspection,
    questions: questions || [],
    responses: responses || {},
    groups: groups || [],
    company,
    responsible,
    subChecklists: subChecklists || {},
    currentGroupId,
    handleResponseChange,
    handleSaveInspection,
    handleSaveSubChecklistResponses,
    getCompletionStats,
    getFilteredQuestions,
    refreshData,
    completeInspection: handleCompleteInspection,
    reopenInspection: handleReopenInspection,
    setCurrentGroupId,
  };
}
