
import { useOptimizedInspectionData } from "./useOptimizedInspectionData";

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
  // Use the optimized inspection data hook
  const optimizedData = useOptimizedInspectionData(inspectionId, {
    autoSaveEnabled: true,
    autoSaveInterval: 30,
    debounceDelay: 2000
  });

  return {
    loading: optimizedData.loading,
    error: optimizedData.error,
    detailedError: optimizedData.detailedError,
    inspection: optimizedData.inspection,
    questions: optimizedData.questions,
    groups: optimizedData.groups,
    responses: optimizedData.responses,
    company: optimizedData.company,
    responsible: optimizedData.responsible,
    responsibles: optimizedData.responsibles,
    subChecklists: optimizedData.subChecklists,
    setResponses: optimizedData.setResponses,
    refreshData: optimizedData.refreshData,
    completeInspection: optimizedData.completeInspection,
    reopenInspection: optimizedData.reopenInspection,
    handleResponseChange: optimizedData.handleResponseChange,
    handleMediaUpload: optimizedData.handleMediaUpload,
    handleMediaChange: optimizedData.handleMediaChange,
    handleSaveInspection: optimizedData.handleSaveInspection,
    savingResponses: optimizedData.savingResponses
  };
}
