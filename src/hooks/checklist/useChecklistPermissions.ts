
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useChecklistPermissions(checklistId?: string) {
  const { user } = useAuth();
  const typedUser = user as AuthUser | null;
  
  return useQuery({
    queryKey: ["checklist-permissions", checklistId],
    queryFn: async () => {
      if (!checklistId) {
        return { read: false, write: false, delete: false };
      }
      
      // Super admin always has full access
      if (typedUser?.tier === "super_admin") {
        return { read: true, write: true, delete: true };
      }
      
      // Company admin has full access to all checklists associated with their company
      if (typedUser?.tier === "company_admin") {
        try {
          // Check if the checklist belongs to the admin's company
          const { data: checklistData, error: checklistError } = await supabase
            .from('checklists')
            .select('company_id')
            .eq('id', checklistId)
            .single();
          
          if (checklistError) throw checklistError;
          
          // If the checklist belongs to this admin's company, grant full access
          if (checklistData.company_id === typedUser.company_id) {
            return { read: true, write: true, delete: true };
          }
        } catch (error) {
          console.error("Error checking company association:", error);
        }
      }

      try {
        // Check for explicit permissions in checklist_permissions table
        const { data, error } = await supabase
          .from('checklist_permissions')
          .select('role')
          .eq('user_id', typedUser?.id)
          .eq('checklist_id', checklistId)
          .single();
        
        if (error) {
          // If no explicit permissions, check if user is assigned to this checklist
          const { data: assignmentData, error: assignmentError } = await supabase
            .from('user_checklists')
            .select('*')
            .eq('user_id', typedUser?.id)
            .eq('checklist_id', checklistId)
            .single();
          
          if (assignmentError) {
            // No permission record or assignment found
            return { read: false, write: false, delete: false };
          }
          
          // User is assigned to this checklist, grant read and write but not delete
          return { read: true, write: true, delete: false };
        }
        
        // Map roles to permissions
        const role = data.role;
        if (role === 'owner' || role === 'admin') {
          return { read: true, write: true, delete: true };
        } else if (role === 'editor') {
          return { read: true, write: true, delete: false };
        } else if (role === 'viewer') {
          return { read: true, write: false, delete: false };
        }
        
        return { read: true, write: false, delete: false };
      } catch (error) {
        console.error("Error checking permissions:", error);
        // By default, allow only reading in case of error
        return { read: true, write: false, delete: false };
      }
    },
    enabled: !!checklistId && !!typedUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
