
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";

// Função para validar se o ID é um UUID válido
function isValidUUID(id: string | null | undefined): boolean {
  if (typeof id !== "string") return false;
  if (id === "editor") return false;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function useChecklistById(checklistId: string) {
  return useQuery({
    queryKey: ["checklist", checklistId],
    queryFn: async () => {
      if (!checklistId) throw new Error("Checklist ID is required");
      if (!isValidUUID(checklistId)) throw new Error("Invalid checklist ID format");
      
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
    enabled: !!checklistId && isValidUUID(checklistId)
  });
}
