
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";
import { generateMockCollaborators } from "@/utils/checklistUtils";

export function useFetchChecklists() {
  return useQuery({
    queryKey: ["checklists"],
    queryFn: async () => {
      console.log("Buscando checklists...");
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar checklists:", error);
        throw error;
      }

      console.log("Dados recebidos do Supabase:", data);

      // Transformando os dados para adicionar informações de colaboradores (mockados por enquanto)
      return data.map((checklist) => ({
        ...checklist,
        collaborators: generateMockCollaborators(2),
        items: Math.floor(Math.random() * 20) + 5, // Número aleatório entre 5 e 25
        permissions: ["editor"],
        // Ensure is_template exists (it should already come from the DB)
        is_template: checklist.is_template === undefined ? false : checklist.is_template
      }));
    }
  });
}
