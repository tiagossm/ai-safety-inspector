
import { useAuthState } from "../auth/useAuthState";

export function useBulkOperationsPermissions() {
  const { user, userRole } = useAuthState();
  
  // Check if the user has permissions to perform bulk operations
  const canPerformBulkOperations = () => {
    // Only allow bulk operations for administrators
    // The userRole could be undefined or null initially, so we need to handle that
    if (!userRole) {
      return false;
    }
    
    // Use type assertion to compare with string literal
    return (userRole as string) === "Administrador";
  };
  
  return {
    canPerformBulkOperations,
  };
}
