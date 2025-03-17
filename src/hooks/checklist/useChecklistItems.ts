
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistItem } from "@/types/checklist";

export function useChecklistItems(checklistId: string) {
  return useQuery({
    queryKey: ["checklist-items", checklistId],
    queryFn: async () => {
      if (!checklistId) {
        console.error("Checklist ID is required but was:", checklistId);
        return [] as ChecklistItem[];
      }
      
      console.log("Buscando itens do checklist:", checklistId);
      
      try {
        const { data, error } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", checklistId)
          .order("ordem", { ascending: true });

        if (error) {
          console.error("Erro ao buscar itens do checklist:", error);
          return [] as ChecklistItem[];
        }

        console.log(`Encontrados ${data?.length || 0} itens do checklist`);
        
        // Map the data to match our ChecklistItem type
        return (data || []).map(item => ({
          ...item,
          tipo_resposta: item.tipo_resposta,
          opcoes: Array.isArray(item.opcoes) 
            ? item.opcoes.map(option => String(option)) 
            : null,
          resposta: null // Add this default value since the column doesn't exist
        })) as ChecklistItem[];
      } catch (err) {
        console.error("Erro ao buscar itens do checklist:", err);
        return [] as ChecklistItem[];
      }
    },
    enabled: !!checklistId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 3
  });
}
