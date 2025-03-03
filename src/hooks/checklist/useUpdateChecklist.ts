
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checklist } from "@/types/checklist";

export function useUpdateChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Checklist> }) => {
      const { error } = await supabase
        .from("checklists")
        .update(data)
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar checklist:", error);
      toast.error("Erro ao atualizar checklist. Tente novamente.");
    }
  });
}
