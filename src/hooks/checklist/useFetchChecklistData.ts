import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";

// Função para validar UUIDs
function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function useFetchChecklistData(id: string) {
  return useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      console.log("🔍 Buscando checklist para ID:", id);

      // **✅ Valida se o ID é um UUID válido antes da requisição**
      if (!id || !isValidUUID(id)) {
        console.error("❌ ID inválido:", id);
        throw new Error("Checklist ID inválido!");
      }

      // **🔹 Buscar checklist no banco**
      const { data: checklistData, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Erro ao buscar checklist:", error);
        throw error;
      }

      console.log("✅ Dados brutos do checklist:", checklistData);

      // **🔹 Buscar o nome do responsável**
      let responsibleName = null;
      const responsibleId = checklistData?.responsible_id || null;

      if (responsibleId) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name")
          .eq("id", responsibleId)
          .single();

        if (userError) {
          console.error("❌ Erro ao buscar usuário responsável:", userError);
        } else {
          responsibleName = userData?.name || "Usuário desconhecido";
        }
      }

      // **✅ Retorno do checklist com segurança**
      return {
        id: checklistData.id,
        title: checklistData.title || "Sem título",
        description: checklistData.description || "Sem descrição",
        created_at: checklistData.created_at || null,
        updated_at: checklistData.updated_at || null,
        status_checklist: checklistData.status_checklist as "ativo" | "inativo",
        is_template: Boolean(checklistData.is_template),
        user_id: checklistData.user_id || null,
        company_id: checklistData.company_id || null,
        status: checklistData.status || "pendente",
        category: checklistData.category || "general",
        responsible_id: responsibleId,
        responsible_name: responsibleName,
      } as Checklist;
    },
    enabled: !!id && isValidUUID(id), // 🔹 Apenas busca se o ID for válido
    staleTime: 5 * 60 * 1000, // 🔹 Cache válido por 5 minutos
    gcTime: 10 * 60 * 1000, // 🔹 Coleta de lixo após 10 minutos
    retry: (failureCount, error) => {
      if (failureCount < 3) {
        console.log(`🔄 Tentativa de nova consulta ${failureCount + 1}`);
        return true;
      }
      return false;
    },
  });
}
