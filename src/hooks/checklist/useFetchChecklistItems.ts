
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistItem } from "@/types/checklist";

export function useFetchChecklistItems(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["checklist-items", id],
    queryFn: async () => {
      console.log("Fetching checklist items for checklist ID:", id);
      
      const { data, error } = await supabase
        .from("checklist_itens")
        .select("*")
        .eq("checklist_id", id)
        .order("ordem", { ascending: true });

      if (error) {
        console.error("Erro ao buscar itens do checklist:", error);
        throw error;
      }

      console.log(`Retrieved ${data.length} checklist items`);

      return data.map(item => {
        // Convert opcoes from Json to string[] if it exists
        let parsedOptions: string[] | null = null;
        if (item.opcoes) {
          try {
            // If opcoes is already an array, use it directly
            if (Array.isArray(item.opcoes)) {
              parsedOptions = item.opcoes.map(String);
            } 
            // If it's a JSON string, parse it
            else if (typeof item.opcoes === 'string') {
              parsedOptions = JSON.parse(item.opcoes);
            }
            // If it's a JSON object already, convert values to strings
            else {
              parsedOptions = Array.isArray(item.opcoes) 
                ? item.opcoes.map(String) 
                : [];
            }
          } catch (e) {
            console.error("Error parsing opcoes:", e);
            parsedOptions = [];
          }
        }

        return {
          ...item,
          tipo_resposta: item.tipo_resposta as "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla",
          opcoes: parsedOptions
        } as ChecklistItem;
      });
    },
    enabled: !!id && enabled, // Only fetch items if checklist exists
    // Add caching and retry configuration
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: (failureCount, error) => {
      // Retry 3 times with exponential backoff for network errors
      if (failureCount < 3) {
        console.log(`Retry attempt ${failureCount + 1} for items query`);
        return true;
      }
      return false;
    },
  });
}
