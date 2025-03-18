
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (checklistId: string) => {
      console.log("Iniciando exclusão do checklist:", checklistId);
      
      if (!checklistId) {
        console.error("ID de checklist inválido para exclusão");
        throw new Error("ID de checklist inválido");
      }
      
      // Primeiro exclui os itens do checklist
      const { error: itemsError, status: itemsStatus } = await supabase
        .from("checklist_itens")
        .delete()
        .eq("checklist_id", checklistId);
      
      if (itemsError) {
        console.error("Erro ao excluir itens do checklist:", itemsError, "Status:", itemsStatus);
        toast.error("Erro ao excluir itens do checklist");
        throw itemsError;
      }
      
      console.log("Itens do checklist excluídos com sucesso");
      
      // Depois exclui as permissões associadas ao checklist
      const { error: permissionsError } = await supabase
        .from("checklist_permissions")
        .delete()
        .eq("checklist_id", checklistId);
      
      if (permissionsError) {
        console.error("Erro ao excluir permissões do checklist:", permissionsError);
        // Não interrompe a operação se falhar na exclusão de permissões
        // Apenas registra o erro e continua
      }
      
      console.log("Permissões do checklist excluídas com sucesso");
      
      // Por fim, exclui o checklist
      const { error, status } = await supabase
        .from("checklists")
        .delete()
        .eq("id", checklistId);
      
      if (error) {
        console.error("Erro ao excluir checklist:", error, "Status:", status);
        toast.error("Erro ao excluir checklist");
        throw error;
      }
      
      console.log("Checklist excluído com sucesso:", checklistId);
      return true;
    },
    onSuccess: () => {
      // Invalida as consultas relacionadas para forçar uma atualização dos dados
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist excluído com sucesso");
    },
    onError: (error: any) => {
      console.error("Erro na mutação de exclusão:", error);
      toast.error("Falha ao excluir checklist: " + (error.message || "Erro desconhecido"));
    }
  });
}
