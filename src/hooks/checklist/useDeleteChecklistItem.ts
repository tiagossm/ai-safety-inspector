
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeleteChecklistItem() {
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("checklist_itens")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item removido com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao excluir item:", error);
      toast.error("Erro ao remover item do checklist");
    }
  });
}
