
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChecklistPermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
}

export function useChecklistPermissions(checklistId: string) {
  return useQuery<ChecklistPermissions>({
    queryKey: ["checklist-permissions", checklistId],
    queryFn: async () => {
      try {
        // First check if the user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Usuário não autenticado");
        }
        
        // Check if the user is the owner of the checklist
        const { data: checklist } = await supabase
          .from("checklists")
          .select("user_id")
          .eq("id", checklistId)
          .single();
          
        if (checklist?.user_id === user.id) {
          // If the user is the owner, they have all permissions
          return {
            read: true,
            write: true,
            delete: true
          };
        }
        
        // Check permissions in the permissions table
        const { data: permissions } = await supabase
          .from("checklist_permissions")
          .select("role")
          .eq("checklist_id", checklistId)
          .eq("user_id", user.id)
          .single();
          
        if (permissions) {
          // Define permissions based on role
          switch (permissions.role) {
            case "admin":
              return { read: true, write: true, delete: true };
            case "editor":
              return { read: true, write: true, delete: false };
            case "viewer":
              return { read: true, write: false, delete: false };
            default:
              return { read: true, write: false, delete: false };
          }
        }
        
        // Check if the user belongs to the same company as the checklist
        const { data: checklistCompany } = await supabase
          .from("checklists")
          .select("company_id")
          .eq("id", checklistId)
          .single();
          
        if (checklistCompany?.company_id) {
          const { data: userCompanies } = await supabase
            .from("user_companies")
            .select("*")
            .eq("user_id", user.id)
            .eq("company_id", checklistCompany.company_id);
            
          if (userCompanies && userCompanies.length > 0) {
            // User belongs to the same company, grant basic access
            return { read: true, write: false, delete: false };
          }
        }
        
        // Default: deny access
        return { read: false, write: false, delete: false };
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        return { read: false, write: false, delete: false };
      }
    },
    enabled: !!checklistId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
