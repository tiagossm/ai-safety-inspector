import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";

// ✅ Função para validar se o ID é um UUID válido
function isValidUUID(id: string | null | undefined): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof id === "string" && uuidRegex.test(id);
}

export function useFetchChecklistData(id: string) {
  return useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      console.log("🔍 Buscando checklist para ID:", id);

      // **✅ Validação do ID antes da requisição**
      if (!isValidUUID(id)) {
        console.error("❌ ID inválido recebido:", id);
        throw new Error("Checklist ID inválido!");
      }

      try {
        // **🔹 Buscar checklist no banco**
        const { data: checklistData, error: checklistError } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", id)
          .single();

        if (checklistError || !checklistData) {
          console.error("❌ Erro ao buscar checklist:", checklistError);
          throw new Error("Checklist não encontrado.");
        }

        console.log("✅ Dados brutos do checklist:", checklistData);

        // **🔹 Buscar nome do responsável, se houver**
        let responsibleName = "Não atribuído";
        const responsibleId = checklistData?.responsible_id || null;

        if (isValidUUID(responsibleId)) {
          try {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("name")
              .eq("id", responsibleId)
              .single();

            if (userError) {
              console.warn("⚠️ Erro ao buscar usuário responsável:", userError);
            } else {
              responsibleName = userData?.name || "Usuário desconhecido";
            }
          } catch (userFetchError) {
            console.warn("⚠️ Erro inesperado ao buscar responsável:", userFetchError);
          }
        }

        // **✅ Retorno seguro dos dados**
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
      } catch (fetchError) {
        console.error("❌ Erro geral ao buscar checklist:", fetchError);
        throw new Error("Erro ao buscar checklist. Tente novamente.");
      }
    },
    enabled: isValidUUID(id), // 🔹 Apenas busca se o ID for válido
    staleTime: 5 * 60 * 1000, // 🔹 Cache válido por 5 minutos
    gcTime: 10 * 60 * 1000, // 🔹 Coleta de lixo após 10 minutos
    retry: (failureCount) => {
      if (failureCount < 3) {
        console.log(`🔄 Tentativa de nova consulta ${failureCount + 1}`);
        return true;
      }
      return false;
    },
  });
}
