
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checklist } from "@/types/checklist";

export function useSaveChecklist(checklistId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Checklist>) => {
      const { error } = await supabase
        .from("checklists")
        .update(data)
        .eq("id", checklistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist atualizado com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao atualizar checklist:", error);
      toast.error("Erro ao atualizar checklist");
    }
  });
}
