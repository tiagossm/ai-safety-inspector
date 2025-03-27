
import { useState } from "react";
import { useInspectionFetch } from "./useInspectionFetch";
import { useResponseHandling } from "./useResponseHandling";
import { useInspectionStatus } from "./useInspectionStatus";
import { useQuestionsManagement } from "./useQuestionsManagement";

export function useInspectionData(inspectionId: string | undefined) {
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

  const [currentInspection, setCurrentInspection] = useState<any>(inspection);

  // Update current inspection when the fetched inspection changes
  if (inspection && inspection !== currentInspection) {
    setCurrentInspection(inspection);
  }

  const {
    handleResponseChange,
    handleSaveInspection,
    handleSaveSubChecklistResponses
  } = useResponseHandling(inspectionId, setResponses);

  const {
    completeInspection: completeInspectionBase,
    reopenInspection: reopenInspectionBase
  } = useInspectionStatus(inspectionId, handleSaveInspection);

  const {
    getFilteredQuestions,
    getCompletionStats
  } = useQuestionsManagement(questions, responses);

  // Wrap the status management functions to update the local state
  const handleSaveInspectionWithUpdate = async () => {
    try {
      const updatedInspection = await handleSaveInspection(responses, currentInspection);
      setCurrentInspection(updatedInspection);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const completeInspection = async () => {
    try {
      const updatedInspection = await completeInspectionBase(responses, currentInspection);
      setCurrentInspection(updatedInspection);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const reopenInspection = async () => {
    try {
      const updatedInspection = await reopenInspectionBase(currentInspection);
      setCurrentInspection(updatedInspection);
      return true;
    } catch (error) {
      throw error;
    }
  };

  return {
    loading,
    inspection: currentInspection || inspection,
    questions,
    responses,
    groups,
    company,
    responsible,
    subChecklists,
    error,
    detailedError,
    handleResponseChange,
    handleSaveInspection: handleSaveInspectionWithUpdate,
    handleSaveSubChecklistResponses,
    getFilteredQuestions,
    getCompletionStats,
    refreshData,
    completeInspection,
    reopenInspection
  };
}
