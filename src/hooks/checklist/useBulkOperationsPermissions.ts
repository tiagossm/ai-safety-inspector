
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";
import { UserRole } from "@/types/user";

export function useBulkOperationsPermissions() {
  const { user } = useAuth();
  const typedUser = user as AuthUser | null;
  
  // Determine permissions based on user tier and role
  const isSuperAdmin = typedUser?.tier === "super_admin";
  const isCompanyAdmin = 
    typedUser?.tier === "company_admin" || 
    typedUser?.role === "admin" || 
    (typedUser?.role as string === "Administrador");
  
  return {
    canCreateChecklist: true, // Everyone can create checklists for now
    canAssignUsers: isSuperAdmin || isCompanyAdmin,
    canAssignCompanies: isSuperAdmin, // Only super admin can assign companies
    canManageAllChecklists: isSuperAdmin,
    canManageCompanyChecklists: isCompanyAdmin,
    canExportChecklists: isSuperAdmin || isCompanyAdmin,
    isSuperAdmin,
    isCompanyAdmin,
    userCompanyId: typedUser?.company_id
  };
}
