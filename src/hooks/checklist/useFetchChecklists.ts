
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
      // e garantir que todos os campos necessários estejam presentes
      return data.map((checklist: any) => ({
        ...checklist,
        // Garantir que status_checklist seja sempre "ativo" ou "inativo"
        status_checklist: checklist.status_checklist === "inativo" ? "inativo" : "ativo",
        // Garantir que is_template seja boolean
        is_template: Boolean(checklist.is_template),
        // Adicionar campos mockados para UI
        collaborators: generateMockCollaborators(2),
        items: Math.floor(Math.random() * 20) + 5, // Número aleatório entre 5 e 25
        permissions: ["editor"]
      })) as Checklist[];
    }
  });
}
