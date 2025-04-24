
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
  subChecklists: Record<string, any>;
  setResponses: (responses: Record<string, any>) => void;
  refreshData: () => void;
  completeInspection: (inspection: any) => Promise<any>;
  reopenInspection: (inspection: any) => Promise<any>;
  handleResponseChange: (questionId: string, data: any) => void;
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
    subChecklists,
    setResponses,
    refreshData,
  } = useInspectionFetch(inspectionId);

  // Use the status hook for completing/reopening the inspection
  const { completeInspection, reopenInspection } = useInspectionStatus(inspectionId);
  
  // Use the questions management hook for handling responses
  // Pass questions as Question[] and also pass setResponses to the hook
  const { handleResponseChange } = useQuestionsManagement(
    questions as Question[], 
    responses, 
    setResponses
  );

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
    subChecklists,
    setResponses,
    refreshData,
    completeInspection,
    reopenInspection,
    handleResponseChange,
  };
}
