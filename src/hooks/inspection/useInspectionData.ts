
import { useCallback } from "react";
import { useInspectionFetch } from "@/hooks/inspection/useInspectionFetch";
import { useInspectionStatus } from "@/hooks/inspection/useInspectionStatus";
import { useQuestionsManagement, Question } from "@/hooks/inspection/useQuestionsManagement";
import { useResponseHandling } from "@/hooks/inspection/useResponseHandling";

// Export type for the hook return value
export interface InspectionDataHook {
  loading: boolean;
  error: string | null;
  detailedError: any;
  inspection: any;
  questions: any[];
  groups: any[];
  responses: Record<string, any>;
  company: any;
  responsible: any;
  responsibles: any[];
  subChecklists: Record<string, any>;
  setResponses: (responses: Record<string, any>) => void;
  refreshData: () => void;
  completeInspection: (inspection: any) => Promise<any>;
  reopenInspection: (inspection: any) => Promise<any>;
  handleResponseChange: (questionId: string, data: any) => void;
  handleMediaUpload: (questionId: string, file: File) => Promise<string | null>;
  handleMediaChange: (questionId: string, mediaUrls: string[]) => void;
  handleSaveInspection: () => Promise<void>;
  savingResponses: boolean;
}

export function useInspectionData(inspectionId: string | undefined): InspectionDataHook {
  // Use the fetch hook for loading data
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
    responsibles,
    subChecklists,
    setResponses,
    refreshData,
  } = useInspectionFetch(inspectionId);

  // Use the status hook for completing/reopening the inspection
  const { completeInspection, reopenInspection } = useInspectionStatus(inspectionId);
  
  // Use the questions management hook for handling responses
  const { handleResponseChange: onQuestionResponseChange } = useQuestionsManagement(
    questions as Question[], 
    responses, 
    setResponses
  );

  // Use the response handling hook
  const {
    handleResponseChange,
    handleMediaChange,
    handleMediaUpload,
    handleSaveInspection: saveInspection,
    savingResponses
  } = useResponseHandling(inspectionId, setResponses);

  // Wrap the save inspection function to provide the current responses and inspection
  const handleSaveInspection = useCallback(async () => {
    if (!inspection) return;
    await saveInspection(responses, inspection);
  }, [saveInspection, responses, inspection]);

  return {
    loading,
    error,
    detailedError,
    inspection,
    questions,
    groups,
    responses,
    company,
    responsible,
    responsibles,
    subChecklists,
    setResponses,
    refreshData,
    completeInspection,
    reopenInspection,
    handleResponseChange,
    handleMediaUpload,
    handleMediaChange,
    handleSaveInspection,
    savingResponses
  };
}
