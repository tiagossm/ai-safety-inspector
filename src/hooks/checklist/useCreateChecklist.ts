
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const extendedUser = user as AuthUser | null;
  
  return useMutation({
    mutationFn: async (newChecklist: NewChecklist) => {
      // Log what we're sending to help debug
      console.log("Creating checklist with data:", newChecklist);
      console.log("Current user company_id:", extendedUser?.company_id);
      
      if (!extendedUser?.company_id && !newChecklist.company_id) {
        console.warn("Atenção: Criando checklist sem associação com empresa.");
      }
      
      const { data, error } = await supabase
        .from("checklists")
        .insert({
          title: newChecklist.title,
          description: newChecklist.description,
          is_template: newChecklist.is_template || false,
          status_checklist: "ativo",
          category: newChecklist.category || "general",
          responsible_id: newChecklist.responsible_id,
          user_id: extendedUser?.id, // Garantir que o user_id está definido
          company_id: newChecklist.company_id || extendedUser?.company_id, // Priorizar company_id do checklist, depois do usuário
          due_date: newChecklist.due_date || null
        })
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar checklist:", error);
      toast.error("Erro ao criar checklist. Tente novamente.");
    }
  });
}
