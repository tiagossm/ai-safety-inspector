
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useChecklistPermissions(checklistId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["checklist-permissions", checklistId, user?.id, user?.company_id],
    queryFn: async () => {
      if (!checklistId || !user) {
        console.log("Sem ID do checklist ou usuário não autenticado - permissões negadas");
        return { read: false, write: false, delete: false };
      }
      
      // Verificação rápida para admins
      if (user.role === "admin" || user.tier === "super_admin") {
        console.log("Usuário é admin - todas as permissões concedidas");
        return { read: true, write: true, delete: true };
      }

      try {
        // Verificar se o checklist pertence à empresa do usuário
        if (user.company_id) {
          const { data: checklist, error } = await supabase
            .from("checklists")
            .select("company_id")
            .eq("id", checklistId)
            .single();
          
          if (error) {
            console.error("Erro ao verificar empresa do checklist:", error);
            return { read: false, write: false, delete: false };
          }
          
          // Se o checklist for da mesma empresa do usuário, concede permissões
          if (checklist && checklist.company_id === user.company_id) {
            console.log("Checklist pertence à empresa do usuário - permissões concedidas");
            return { read: true, write: true, delete: true };
          }
        }
        
        // Verificar permissões específicas na tabela checklist_permissions
        const { data: permissions, error } = await supabase
          .from("checklist_permissions")
          .select("role")
          .eq("checklist_id", checklistId)
          .eq("user_id", user.id)
          .single();
        
        if (error) {
          console.log("Sem permissões específicas para este checklist");
          return { read: false, write: false, delete: false };
        }
        
        if (permissions) {
          const role = permissions.role;
          console.log(`Permissão do usuário para o checklist: ${role}`);
          
          if (role === "owner" || role === "admin") {
            return { read: true, write: true, delete: true };
          } else if (role === "editor") {
            return { read: true, write: true, delete: false };
          } else if (role === "viewer") {
            return { read: true, write: false, delete: false };
          }
        }
        
        // Por padrão, permitir apenas leitura para usuários autenticados
        return { read: true, write: false, delete: false };
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        return { read: false, write: false, delete: false };
      }
    },
    enabled: !!checklistId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}
