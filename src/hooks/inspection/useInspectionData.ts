
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
  const { completeInspection: updateInspectionStatus, reopenInspection: updateReopenStatus } = useInspectionStatus(inspectionId);
  
  // Get questions management functionality
  const { getFilteredQuestions, getCompletionStats, availableGroups } = useQuestionsManagement(
    questions || [],
    responses || {}
  );

  // Handle responses and saving
  const { 
    handleResponseChange, 
    handleSaveInspection, 
    handleSaveSubChecklistResponses 
  } = useResponseHandling(inspectionId, setResponses);

  // Set initial group when data is loaded
  useMemo(() => {
    if (!loading && !currentGroupId && groups && groups.length > 0) {
      setCurrentGroupId(groups[0].id);
    }
  }, [loading, groups, currentGroupId]);

  // Wrap save function
  const saveInspection = useCallback(async (): Promise<void> => {
    if (!inspectionId) throw new Error("ID da inspeção não fornecido");
    if (!inspection) return;
    await handleSaveInspection(responses || {}, inspection);
  }, [inspectionId, inspection, responses, handleSaveInspection]);

  // Wrap subchecklist save function
  const saveSubchecklist = useCallback(async (subChecklistId: string, subchecklistResponses: Record<string, any>): Promise<void> => {
    if (!inspectionId) throw new Error("ID da inspeção não fornecido");
    await handleSaveSubChecklistResponses(subChecklistId, subchecklistResponses);
  }, [inspectionId, handleSaveSubChecklistResponses]);

  // Wrap completeInspection function
  const handleCompleteInspection = useCallback(async (): Promise<void> => {
    if (!inspection) throw new Error("Inspeção não carregada");
    // First save current state
    if (responses) {
      await handleSaveInspection(responses, inspection);
    }
    // Then complete inspection
    await updateInspectionStatus(inspection);
  }, [inspection, responses, handleSaveInspection, updateInspectionStatus]);

  // Wrap reopenInspection function
  const handleReopenInspection = useCallback(async (): Promise<void> => {
    if (!inspection) throw new Error("Inspeção não carregada");
    await updateReopenStatus(inspection);
  }, [inspection, updateReopenStatus]);

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
    handleSaveInspection: saveInspection,
    handleSaveSubChecklistResponses: saveSubchecklist,
    getCompletionStats,
    getFilteredQuestions,
    refreshData,
    completeInspection: handleCompleteInspection,
    reopenInspection: handleReopenInspection,
    setCurrentGroupId,
  };
}
