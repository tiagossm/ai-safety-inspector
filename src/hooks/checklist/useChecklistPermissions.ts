
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
      if (!checklistId) {
        return { read: false, write: false, delete: false };
      }

      try {
        // Verificar se o usuário é o criador do checklist
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { read: false, write: false, delete: false };
        }

        // Buscar o checklist para verificar se o usuário é o criador
        const { data: checklist, error: checklistError } = await supabase
          .from("checklists")
          .select("user_id")
          .eq("id", checklistId)
          .single();

        if (checklistError) {
          console.error("Erro ao verificar permissões do checklist:", checklistError);
          return { read: false, write: false, delete: false };
        }

        // Se o usuário é o criador, conceder permissões totais
        if (checklist.user_id === user.id) {
          return { read: true, write: true, delete: true };
        }

        // Verificar permissões específicas na tabela checklist_permissions
        const { data: permissions, error: permissionsError } = await supabase
          .from("checklist_permissions")
          .select("role")
          .eq("checklist_id", checklistId)
          .eq("user_id", user.id)
          .single();

        if (permissionsError) {
          // Se não encontrar permissões específicas, assumir que não tem acesso
          if (permissionsError.code === "PGRST116") { // Código de erro "não encontrado"
            return { read: false, write: false, delete: false };
          }
          console.error("Erro ao buscar permissões:", permissionsError);
          return { read: false, write: false, delete: false };
        }

        // Definir permissões com base no papel do usuário
        switch (permissions.role) {
          case "admin":
            return { read: true, write: true, delete: true };
          case "editor":
            return { read: true, write: true, delete: false };
          case "viewer":
            return { read: true, write: false, delete: false };
          default:
            return { read: false, write: false, delete: false };
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        return { read: false, write: false, delete: false };
      }
    },
    enabled: !!checklistId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
