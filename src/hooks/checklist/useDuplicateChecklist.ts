
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checklist } from "@/types/checklist";

export function useDuplicateChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (checklist: Checklist) => {
      // Create a duplicate of the checklist with a new title
      const newTitle = `Cópia de ${checklist.title}`;
      
      console.log("Duplicating checklist:", { 
        original: checklist.id, 
        newTitle 
      });
      
      const { data, error } = await supabase
        .from("checklists")
        .insert({
          title: newTitle,
          description: checklist.description,
          is_template: checklist.is_template,
          status_checklist: "ativo"
        })
        .select();

      if (error) {
        console.error("Error duplicating checklist:", error);
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist duplicado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao duplicar checklist:", error);
      toast.error("Erro ao duplicar checklist. Tente novamente.");
    }
  });
}
