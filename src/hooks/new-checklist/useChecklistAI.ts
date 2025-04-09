
// This file will be replaced by our more focused hooks
import { useChecklistAIGeneration } from './ai/useChecklistAIGeneration';
import { AIAssistantType } from "@/types/newChecklist"; // Import from the types file

// Export the AIAssistantType for backward compatibility
export { AIAssistantType }; 

// Export for backward compatibility
export { useChecklistAIGeneration as useChecklistAI };
export default useChecklistAIGeneration;
