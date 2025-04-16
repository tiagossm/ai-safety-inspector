
import { useState, useCallback } from "react";
import { useInspectionFetch } from "./useInspectionFetch";
import { useResponseHandling } from "./useResponseHandling";
import { useInspectionStatus } from "./useInspectionStatus";
import { toast } from "sonner";

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
      return updatedInspection;
    } catch (error) {
      // Error handling is now in the InspectionExecutionPage
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
    } catch (error) {
      // Error handling is now in the InspectionExecutionPage
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
    } catch (error) {
      // Error handling is now in the InspectionExecutionPage
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
    handleResponseChange,
    handleSaveInspection: saveInspection,
    handleSaveSubChecklistResponses,
    getCompletionStats,
    error,
    detailedError,
    refreshData,
    completeInspection,
    reopenInspection
  };
}
