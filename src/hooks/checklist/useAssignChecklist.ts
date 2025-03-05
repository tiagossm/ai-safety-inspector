
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssignChecklistParams {
  checklistId: string;
  userIds: string[];
  companyId?: string;
}

export function useAssignChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ checklistId, userIds, companyId }: AssignChecklistParams) => {
      try {
        // Call our edge function to assign the checklist with proper permission checks
        const { data, error } = await supabase.functions.invoke("assign-checklist", {
          body: { 
            checklist_id: checklistId, 
            user_ids: userIds,
            company_id: companyId
          }
        });
        
        if (error) throw error;
        
        if (!data.success) {
          throw new Error(data.error || "Failed to assign checklist");
        }
        
        return data;
      } catch (error) {
        console.error("Error assigning checklist:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["user-checklists"] });
      toast.success("Checklist atribuído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atribuir checklist:", error);
      toast.error("Erro ao atribuir checklist. " + (error instanceof Error ? error.message : ""));
    }
  });
}
