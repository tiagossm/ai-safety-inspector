
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";

export function useChecklistById(checklistId: string) {
  return useQuery({
    queryKey: ["checklist", checklistId],
    queryFn: async () => {
      if (!checklistId) throw new Error("Checklist ID is required");
      
      console.log("Buscando checklist por ID:", checklistId);
      
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", checklistId)
        .single();

      if (error) {
        console.error("Erro ao buscar checklist:", error);
        throw error;
      }

      console.log("Checklist encontrado:", data);
      
      return data as Checklist;
    },
    enabled: !!checklistId
  });
}
