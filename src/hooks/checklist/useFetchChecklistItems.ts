
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistItem } from "@/types/checklist";

export function useFetchChecklistItems(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["checklist-items", id],
    queryFn: async () => {
      if (!id) {
        console.error("Invalid checklist ID provided:", id);
        throw new Error("ID do checklist inválido");
      }
      
      console.log("Fetching checklist items for checklist ID:", id);
      
      try {
        const { data, error } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", id)
          .order("ordem", { ascending: true });

        if (error) {
          console.error("Error fetching checklist items:", error);
          throw error;
        }

        console.log(`Retrieved ${data?.length || 0} checklist items`);

        // Map the data to match our ChecklistItem type
        return (data || []).map(item => ({
          ...item,
          tipo_resposta: item.tipo_resposta,
          opcoes: Array.isArray(item.opcoes) 
            ? item.opcoes.map(option => String(option)) 
            : null,
          resposta: null // Add default null value since the column doesn't exist
        })) as ChecklistItem[];
      } catch (err) {
        console.error("Failed to fetch checklist items:", err);
        return [] as ChecklistItem[]; // Return empty array instead of throwing
      }
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });
}
