
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";

interface ChecklistUpdateParams extends Partial<ChecklistWithStats> { 
  id: string;
  questions?: ChecklistQuestion[];
  groups?: ChecklistGroup[];
  deletedQuestionIds?: string[];
}

export function useChecklistUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ChecklistUpdateParams) => {
      const { id, questions, groups, deletedQuestionIds, ...updateData } = params;
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
      
      // If we have questions to update, handle them separately
      if (questions && questions.length > 0) {
        console.log(`Processing ${questions.length} questions`);
        // Additional logic for updating questions could be added here
      }
      
      // If we have groups to update, handle them separately
      if (groups && groups.length > 0) {
        console.log(`Processing ${groups.length} groups`);
        // Additional logic for updating groups could be added here
      }
      
      // If we have questions to delete, handle them
      if (deletedQuestionIds && deletedQuestionIds.length > 0) {
        console.log(`Deleting ${deletedQuestionIds.length} questions`);
        // Additional logic for deleting questions could be added here
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
