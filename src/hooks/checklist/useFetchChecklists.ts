import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";
import { handleApiError } from "@/utils/errors";

// ✅ Valida se o ID é um UUID
function isValidUUID(id: string | null | undefined): boolean {
  if (typeof id !== "string") return false;
  if (id === "editor") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function useFetchChecklists() {
  return useQuery({
    queryKey: ["checklists-list"],
    queryFn: async () => {
      try {
        // Nova abordagem: Primeiro buscamos os checklists sem relacionamentos
        const { data: checklistsData, error: checklistsError } = await supabase
          .from("checklists")
          .select("*")
          .order("created_at", { ascending: false });

        if (checklistsError) {
          throw new Error(`Erro ao buscar checklists: ${checklistsError.message}`);
        }

        const checklists = await Promise.all(
          (checklistsData || []).map(async (checklistData) => {
            // Perform type assertion with unknown as intermediate step
            const typedChecklistData = checklistData as unknown as {
              id: string;
              title: string;
              description?: string | null;
              category: string;
              is_template: boolean;
              parent_question_id?: string | null;
              user_id?: string | null;
              company_id?: string | null;
              created_at?: string;
              updated_at?: string;
              status?: string;
              status_checklist?: string;
              responsible_id?: string | null;
              [key: string]: any;
            };

            // Para cada checklist, buscamos separadamente o nome do usuário responsável
            let responsibleName = "Não atribuído";
            const responsibleId = typedChecklistData.responsible_id;
            if (isValidUUID(responsibleId)) {
              const { data: userData } = await supabase
                .from("users")
                .select("name")
                .eq("id", responsibleId)
                .single();
              responsibleName = userData?.name || "Usuário desconhecido";
            }

            // Para cada checklist, buscamos separadamente o nome do criador
            let createdByName = "Desconhecido";
            const userId = typedChecklistData.user_id;
            if (isValidUUID(userId)) {
              const { data: creatorData } = await supabase
                .from("users")
                .select("name")
                .eq("id", userId)
                .single();
              createdByName = creatorData?.name || "Usuário desconhecido";
            }

            // Count checklist items
            const { count: itemsCount, error: countError } = await supabase
              .from("checklist_itens")
              .select("*", { count: "exact", head: true })
              .eq("checklist_id", typedChecklistData.id);

            if (countError) {
              console.warn(`Erro ao contar itens do checklist ${typedChecklistData.id}:`, countError);
            }

            return {
              id: typedChecklistData.id,
              title: typedChecklistData.title || "Sem título",
              description: typedChecklistData.description || "Sem descrição",
              created_at: typedChecklistData.created_at,
              updated_at: typedChecklistData.updated_at,
              status: typedChecklistData.status || "ativo",
              status_checklist: typedChecklistData.status_checklist,
              is_template: typedChecklistData.is_template || false,
              user_id: typedChecklistData.user_id,
              company_id: typedChecklistData.company_id,
              responsible_id: responsibleId,
              responsible_name: responsibleName,
              created_by_name: createdByName,
              category: typedChecklistData.category || "general",
              items: itemsCount || 0,
            } as Checklist;
          })
        );

        return checklists;
      } catch (err) {
        // Corrigido para usar o handleApiError que agora aceita um segundo parâmetro opcional
        throw new Error(handleApiError(err, "Erro ao buscar lista de checklists."));
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
