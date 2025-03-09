
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (checklistId: string) => {
      // Primeiro exclui os itens do checklist
      const { error: itemsError } = await supabase
        .from("checklist_itens")
        .delete()
        .eq("checklist_id", checklistId);
      
      if (itemsError) {
        console.error("Erro ao excluir itens do checklist:", itemsError);
        throw itemsError;
      }
      
      // Depois exclui as permissões associadas ao checklist
      const { error: permissionsError } = await supabase
        .from("checklist_permissions")
        .delete()
        .eq("checklist_id", checklistId);
      
      if (permissionsError) {
        console.error("Erro ao excluir permissões do checklist:", permissionsError);
        // Não interrompe a operação se falhar na exclusão de permissões
      }
      
      // Por fim, exclui o checklist
      const { error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", checklistId);
      
      if (error) {
        console.error("Erro ao excluir checklist:", error);
        throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      // Invalida as consultas relacionadas para forçar uma atualização dos dados
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    }
  });
}
