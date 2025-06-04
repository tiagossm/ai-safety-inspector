
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
          company_id: data.company_id,
          due_date: data.due_date,
          status: data.status
        })
        .eq("id", checklistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar checklist:", error);
    }
  });
}
