
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checklist } from "@/types/checklist";

export function useSaveChecklist(checklistId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Checklist>) => {
      // Ensure we're handling all properties
      const { error } = await supabase
        .from("checklists")
        .update({
          title: data.title,
          description: data.description,
          is_template: data.is_template,
          status_checklist: data.status_checklist,
          category: data.category,
          responsible_id: data.responsible_id,
          company_id: data.company_id
        })
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
