
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export function useChecklistPermissions(checklistId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["checklist-permissions", checklistId],
    queryFn: async () => {
      if (!checklistId) {
        return { read: false, write: false, delete: false };
      }
      
      // Verifique se o usuário é admin (verificação rápida sem chamar a edge function)
      if (user?.role === "admin" || user?.tier === "super_admin") {
        return { read: true, write: true, delete: true };
      }

      try {
        const { data, error } = await supabase.functions.invoke("check-permissions", {
          body: { checklist_id: checklistId }
        });
        
        if (error) throw error;
        
        if (data.success) {
          return data.permissions;
        }
        
        return { read: false, write: false, delete: false };
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        // Por padrão, permitir apenas leitura em caso de erro
        return { read: true, write: false, delete: false };
      }
    },
    enabled: !!checklistId && !!user,
    // Mantém as permissões em cache por um tempo razoável
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}
