
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";
import { toast } from "sonner";

export function useChecklistUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checklist: Partial<ChecklistWithStats> & { id: string }) => {
      const { id, ...updateData } = checklist;
      console.log(`Updating checklist ${id} with:`, updateData);
      
      const { data, error } = await supabase
        .from("checklists")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating checklist:", error);
        throw error;
      }
      
      console.log("Checklist updated successfully:", data);
      return data;
    },
    onSuccess: () => {
      toast.success("Checklist atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Erro ao atualizar checklist");
    }
  });
}
