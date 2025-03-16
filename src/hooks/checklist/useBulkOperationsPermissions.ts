
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
    
    const typedUser = user as AuthUser;
    return typedUser.role === "super_admin" || 
           (typedUser as any).role === "Administrador";
  };
  
  return {
    canPerformBulkOperations,
  };
}
