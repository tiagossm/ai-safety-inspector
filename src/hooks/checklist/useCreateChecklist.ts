
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newChecklist: NewChecklist) => {
      const { data, error } = await supabase
        .from("checklists")
        .insert({
          title: newChecklist.title,
          description: newChecklist.description,
          is_template: newChecklist.is_template,
          status_checklist: "ativo",
        })
        .select();

      if (error) {
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
