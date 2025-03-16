
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
        // Primeiro verificamos se o usuário é o criador do checklist
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Usuário não autenticado");
        }
        
        // Verificar se o usuário é o dono do checklist
        const { data: checklist } = await supabase
          .from("checklists")
          .select("user_id")
          .eq("id", checklistId)
          .single();
          
        if (checklist?.user_id === user.id) {
          // Se o usuário é o dono, tem todas as permissões
          return {
            read: true,
            write: true,
            delete: true
          };
        }
        
        // Verificar na tabela de permissões
        const { data: permissions } = await supabase
          .from("checklist_permissions")
          .select("role")
          .eq("checklist_id", checklistId)
          .eq("user_id", user.id)
          .single();
          
        if (permissions) {
          // Define permissões baseadas no papel
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
        
        // Verificar se o usuário pertence à mesma empresa do checklist
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
            // O usuário pertence à mesma empresa, conceder acesso básico
            return { read: true, write: false, delete: false };
          }
        }
        
        // Por padrão, negar acesso
        return { read: false, write: false, delete: false };
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        return { read: false, write: false, delete: false };
      }
    },
    enabled: !!checklistId,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });
}
