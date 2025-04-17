
import { useState, useCallback, useEffect } from "react";
import { useInspectionFetch } from "./useInspectionFetch";
import { useResponseHandling } from "./useResponseHandling";
import { useInspectionStatus } from "./useInspectionStatus";
import { toast } from "sonner";
import { useQuestionsManagement } from "./useQuestionsManagement";

export function useInspectionData(inspectionId: string | undefined) {
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
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
  
  // Definir automaticamente o primeiro grupo quando carregado
  useEffect(() => {
    if (!loading && groups.length > 0 && !currentGroupId) {
      const firstGroupId = groups[0].id;
      console.log(`Auto-selecting first group: ${firstGroupId}`);
      setCurrentGroupId(firstGroupId);
    }
  }, [loading, groups, currentGroupId]);
  
  const { getFilteredQuestions, getCompletionStats: getQuestionsStats } = 
    useQuestionsManagement(questions, responses);
  
  const {
    handleResponseChange,
    handleSaveInspection,
    handleSaveSubChecklistResponses
  } = useResponseHandling(inspectionId, setResponses);

  const { completeInspection: completeInspectionStatus, reopenInspection: reopenInspectionStatus } = 
    useInspectionStatus(inspectionId, handleSaveInspection);
  
  // Calculate completion statistics
  const getCompletionStats = useCallback(() => {
    const totalQuestions = questions.length;
    let answeredQuestions = 0;
    let groupStats: Record<string, { total: number; completed: number }> = {};
    
    // Log para debug
    console.log(`getCompletionStats called, questions.length: ${totalQuestions}`);
    
    // Initialize group stats for all groups
    groups.forEach(group => {
      groupStats[group.id] = { total: 0, completed: 0 };
    });
    
    // Count questions and answers by group
    questions.forEach(question => {
      const groupId = question.groupId || 'default-group';
      
      // Create group entry if it doesn't exist
      if (!groupStats[groupId]) {
        groupStats[groupId] = { total: 0, completed: 0 };
      }
      
      // Increment total count
      groupStats[groupId].total += 1;
      
      // Check if question is answered
      if (responses[question.id] && responses[question.id].value !== undefined) {
        groupStats[groupId].completed += 1;
        answeredQuestions += 1;
      }
    });
    
    const completionPercentage = totalQuestions > 0 
      ? Math.round((answeredQuestions / totalQuestions) * 100) 
      : 0;
    
    console.log(`Stats: ${answeredQuestions}/${totalQuestions} questions answered (${completionPercentage}%)`);
    console.log('Group stats:', groupStats);
    
    return {
      totalQuestions,
      answeredQuestions,
      completionPercentage,
      groupStats
    };
  }, [questions, responses, groups]);
  
  // Save inspection progress
  const saveInspection = async () => {
    if (!inspection) return;
    
    try {
      setSaving(true);
      const updatedInspection = await handleSaveInspection(responses, inspection);
      toast.success("Progresso salvo com sucesso");
      return updatedInspection;
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message || "Erro desconhecido"}`);
      throw error;
    } finally {
      setSaving(false);
    }
  };
  
  // Complete inspection
  const completeInspection = async () => {
    if (!inspection) return;
    
    try {
      setSaving(true);
      await handleSaveInspection(responses, inspection);
      
      const updatedInspection = await completeInspectionStatus(responses, inspection);
      
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
  
  // Reopen inspection
  const reopenInspection = async () => {
    if (!inspection) return;
    
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
  
  // Diagnose any issues with the inspection data
  useEffect(() => {
    if (!loading && questions.length === 0) {
      console.warn("No questions found for this inspection. This might be a data issue.");
      if (inspection?.checklistId) {
        console.log(`This inspection uses checklist ID: ${inspection.checklistId}`);
      }
    }
  }, [loading, questions, inspection]);

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
    handleSaveInspection: saveInspection,
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
