
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";

export function useFetchChecklistData(id: string) {
  return useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      console.log("Fetching checklist data for ID:", id);
      
      if (!id) {
        throw new Error("Checklist ID is required");
      }
      
      // Garantir que o ID seja tratado como UUID
      const { data: checklistData, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar checklist:", error);
        throw error;
      }

      console.log("Raw checklist data:", checklistData);

      // Buscar o nome do responsável se houver um ID
      let responsibleName = null;
      
      // Acessa responsible_id com segurança
      const rawData = checklistData as any;
      const responsibleId = rawData.responsible_id || null;
      
      if (responsibleId) {
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', responsibleId)
          .single();

        if (userData) {
          responsibleName = userData.name;
        }
      }

      // Garantir que retornamos um objeto Checklist corretamente tipado
      return {
        id: checklistData.id,
        title: checklistData.title,
        description: checklistData.description,
        created_at: checklistData.created_at,
        updated_at: checklistData.updated_at,
        status_checklist: checklistData.status_checklist as "ativo" | "inativo",
        is_template: Boolean(checklistData.is_template),
        user_id: checklistData.user_id,
        company_id: checklistData.company_id,
        status: checklistData.status,
        // Acessa category com segurança
        category: (rawData.category !== undefined) ? rawData.category : undefined,
        responsible_id: responsibleId,
        responsible_name: responsibleName
      } as Checklist;
    },
    enabled: !!id,
    // Adiciona configuração de cache e tentativas
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000, // 10 minutos de coleta de lixo
    retry: (failureCount, error) => {
      // Tentar 3 vezes com backoff exponencial para erros de rede
      if (failureCount < 3) {
        console.log(`Retry attempt ${failureCount + 1} for checklist query`);
        return true;
      }
      return false;
    },
  });
}
