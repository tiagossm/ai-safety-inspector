
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useBulkOperationsPermissions() {
  const { user } = useAuth();
  
  // Check if the user has permissions to perform bulk operations
  const canPerformBulkOperations = () => {
    if (!user) {
      return false;
    }
    
    // Super admins and company admins can perform bulk operations
    const typedUser = user as AuthUser;
    return typedUser.tier === "super_admin" || 
           typedUser.tier === "company_admin" || 
           typedUser.role === "admin";
  };
  
  return {
    canPerformBulkOperations,
  };
}
