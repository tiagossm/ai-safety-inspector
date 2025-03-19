
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
      
      try {
        // 1. Primeiro precisamos buscar todos os itens deste checklist para depois excluir seus comentários
        const { data: itemsData, error: itemsQueryError } = await supabase
          .from("checklist_itens")
          .select("id")
          .eq("checklist_id", checklistId);
          
        if (itemsQueryError) {
          throw itemsQueryError;
        }
        
        const itemIds = itemsData?.map(item => item.id) || [];
        
        if (itemIds.length > 0) {
          // 2. Excluir comentários dos itens
          console.log(`Excluindo comentários de ${itemIds.length} itens do checklist`);
          const { error: commentsError } = await supabase
            .from("checklist_item_comments")
            .delete()
            .in("checklist_item_id", itemIds);
            
          if (commentsError) {
            console.error("Erro ao excluir comentários dos itens:", commentsError);
            throw commentsError;
          }
          
          // 3. Excluir mídia dos itens
          const { error: mediaError } = await supabase
            .from("checklist_item_media")
            .delete()
            .in("checklist_item_id", itemIds);
            
          if (mediaError) {
            console.error("Erro ao excluir mídia dos itens:", mediaError);
            throw mediaError;
          }
        }
        
        // 4. Agora excluímos os itens do checklist
        const { error: itemsError } = await supabase
          .from("checklist_itens")
          .delete()
          .eq("checklist_id", checklistId);
        
        if (itemsError) {
          console.error("Erro ao excluir itens do checklist:", itemsError);
          throw itemsError;
        }
        
        console.log("Itens do checklist excluídos com sucesso");
        
        // 5. Excluir os comentários do checklist
        const { error: checklistCommentsError } = await supabase
          .from("checklist_comments")
          .delete()
          .eq("checklist_id", checklistId);
          
        if (checklistCommentsError) {
          console.error("Erro ao excluir comentários do checklist:", checklistCommentsError);
          // Não interrompemos se falhar aqui, continuamos com outras exclusões
        }
        
        // 6. Excluir arquivos anexados ao checklist
        const { error: attachmentsError } = await supabase
          .from("checklist_attachments")
          .delete()
          .eq("checklist_id", checklistId);
          
        if (attachmentsError) {
          console.error("Erro ao excluir anexos do checklist:", attachmentsError);
          // Não interrompemos se falhar aqui, continuamos com outras exclusões
        }
        
        // 7. Excluir histórico do checklist
        const { error: historyError } = await supabase
          .from("checklist_history")
          .delete()
          .eq("checklist_id", checklistId);
          
        if (historyError) {
          console.error("Erro ao excluir histórico do checklist:", historyError);
          // Não interrompemos se falhar aqui, continuamos
        }
        
        // 8. Excluir permissões associadas ao checklist
        const { error: permissionsError } = await supabase
          .from("checklist_permissions")
          .delete()
          .eq("checklist_id", checklistId);
        
        if (permissionsError) {
          console.error("Erro ao excluir permissões do checklist:", permissionsError);
          // Não interrompemos se falhar aqui
        }
        
        // 9. Por fim, excluir o checklist
        const { error } = await supabase
          .from("checklists")
          .delete()
          .eq("id", checklistId);
        
        if (error) {
          console.error("Erro ao excluir checklist:", error);
          throw error;
        }
        
        console.log("Checklist excluído com sucesso:", checklistId);
        return true;
      } catch (error) {
        console.error("Erro completo na exclusão:", error);
        throw error;
      }
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
