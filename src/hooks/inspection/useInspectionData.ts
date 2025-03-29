
import { useState, useCallback } from "react";
import { useInspectionFetch } from "./useInspectionFetch";
import { useResponseHandling } from "./useResponseHandling";

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
      
      const { error } = await fetch("/api/completeInspection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspectionId, userId: inspection.userId })
      }).then(res => res.json());
      
      if (error) throw new Error(error);
      
      await refreshData();
      return true;
    } finally {
      setSaving(false);
    }
  };
  
  // Reopen inspection
  const reopenInspection = async () => {
    if (!inspection) return;
    
    try {
      setSaving(true);
      const { error } = await fetch("/api/reopenInspection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspectionId, userId: inspection.userId })
      }).then(res => res.json());
      
      if (error) throw new Error(error);
      
      await refreshData();
      return true;
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
