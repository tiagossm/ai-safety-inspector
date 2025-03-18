
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistItem } from "@/types/checklist";
import { toast } from "sonner";

export function useChecklistItems(checklistId: string) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ["checklist-items", checklistId],
    queryFn: async () => {
      if (!checklistId) {
        console.error("Checklist ID is required but was:", checklistId);
        toast.error("ID do checklist não fornecido");
        return [] as ChecklistItem[];
      }
      
      console.log("Buscando itens do checklist:", checklistId);
      
      try {
        const { data, error, status } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", checklistId)
          .order("ordem", { ascending: true });

        if (error) {
          console.error("Erro ao buscar itens do checklist:", error, "Status:", status);
          toast.error("Erro ao buscar itens do checklist");
          return [] as ChecklistItem[];
        }

        console.log(`Encontrados ${data?.length || 0} itens do checklist ${checklistId}`);
        
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
        toast.error("Falha ao carregar itens");
        return [] as ChecklistItem[];
      }
    },
    enabled: !!checklistId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 3,
    refetchOnWindowFocus: true,
  });
}
