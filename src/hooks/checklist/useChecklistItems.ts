
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistItem } from "@/types/checklist";

export function useChecklistItems(checklistId: string) {
  return useQuery({
    queryKey: ["checklist-items", checklistId],
    queryFn: async () => {
      if (!checklistId) throw new Error("Checklist ID is required");
      
      console.log("Buscando itens do checklist:", checklistId);
      
      const { data, error } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", checklistId)
        .order("ordem", { ascending: true });

      if (error) {
        console.error("Erro ao buscar itens do checklist:", error);
        throw error;
      }

      console.log(`Encontrados ${data?.length} itens do checklist`);
      
      return data as ChecklistItem[];
    },
    enabled: !!checklistId
  });
}
