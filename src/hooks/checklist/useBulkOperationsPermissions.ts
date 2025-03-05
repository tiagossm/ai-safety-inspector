
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useBulkOperationsPermissions() {
  const { user } = useAuth();
  
  // Check if the user has permissions to perform bulk operations
  const canPerformBulkOperations = () => {
    // Only allow bulk operations for administrators
    if (!user) {
      return false;
    }
    
    // Use type assertion to compare with string literal
    return (user as AuthUser).role === "admin" || 
           (user as any).role === "Administrador";
  };
  
  return {
    canPerformBulkOperations,
  };
}
