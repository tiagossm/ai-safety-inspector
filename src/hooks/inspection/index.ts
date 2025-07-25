
// Export all inspection hooks for easier imports
export * from "./useInspectionFetch";
export { useResponseHandling } from "./useResponseHandling";
export type { ResponseData } from "./useResponseHandling";
export * from "./useInspectionStatus";
export * from "./useQuestionsManagement";
export * from "./useQuestionResponse";
export * from "./useInspectionData";
export * from "./useOptimizedInspectionData";
export * from "./useAutoSave";
export * from "./useInspectionMetrics";
export * from "./useInspectionValidation";
export * from "./useOptimizedSubChecklistHandler";
export type { 
  InspectionResponse, 
  Question as CentralizedQuestion, 
  Inspection, 
  Company, 
  Responsible, 
  InspectionMetrics,
  AutoSaveConfig,
  AutoSaveState 
} from "./types";
