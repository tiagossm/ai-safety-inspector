
import { useAuth } from "@/components/AuthProvider";

export function useBulkOperationsPermissions() {
  const { user } = useAuth();
  
  // Allow bulk operations for all users, removing restrictions
  const canPerformBulkOperations = () => {
    return true; // Allow for everyone
  };
  
  return {
    canPerformBulkOperations,
  };
}
