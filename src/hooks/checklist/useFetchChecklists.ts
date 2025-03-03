
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
      return data.map((checklist: any) => ({
        ...checklist,
        collaborators: generateMockCollaborators(2),
        items: Math.floor(Math.random() * 20) + 5, // Número aleatório entre 5 e 25
        permissions: ["editor"],
        isTemplate: checklist.is_template // Create the UI property from the database field
      }));
    }
  });
}
