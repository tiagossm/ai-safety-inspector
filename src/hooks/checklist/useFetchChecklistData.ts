import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";

// ✅ Valida se o ID é um UUID
function isValidUUID(id: string | null | undefined): boolean {
  if (typeof id !== "string") return false;
  if (id === "editor") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function useFetchChecklistData(id: string) {
  return useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      console.log("🔍 Buscando checklist para ID:", id);
      if (!isValidUUID(id)) {
        throw new Error("Checklist ID inválido!");
      }

      try {
        const { data: checklistData, error: checklistError } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", id)
          .single();

        if (checklistError || !checklistData) {
          throw new Error("Checklist não encontrado.");
        }

        // Buscar perguntas
        const { data: checklistItens, error: itensError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", id)
          .order("ordem", { ascending: true });

        if (itensError) {
          console.warn("Erro ao buscar perguntas:", itensError);
        }

        // Processar grupos a partir do campo "hint"
        const groupsMap = new Map();
        const processedQuestions = (checklistItens || []).map((item: any) => {
          let groupId = null;

          if (item.hint) {
            try {
              const hint = JSON.parse(item.hint);
              if (hint.groupId && hint.groupTitle) {
                groupId = hint.groupId;
                if (!groupsMap.has(groupId)) {
                  groupsMap.set(groupId, {
                    id: groupId,
                    title: hint.groupTitle,
                    order: hint.groupIndex || 0,
                  });
                }
              }
            } catch (e) {
              console.warn("Erro ao interpretar hint:", item.hint);
            }
          }

          return {
            id: item.id,
            ordem: item.ordem,
            pergunta: item.pergunta,
            tipo_resposta: item.tipo_resposta,
            opcoes: item.opcoes,
            obrigatorio: item.obrigatorio,
            permite_foto: item.permite_foto,
            permite_video: item.permite_video,
            permite_audio: item.permite_audio,
            weight: item.weight,
            hint: item.hint,
            groupId,
            parent_item_id: item.parent_item_id,
            condition_value: item.condition_value,
            sub_checklist_id: item.sub_checklist_id || null,
          };
        });

        const groups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);

        // Buscar nome do responsável
        let responsibleName = "Não atribuído";
        const responsibleId = checklistData.responsible_id;
        if (isValidUUID(responsibleId)) {
          const { data: userData } = await supabase
            .from("users")
            .select("name")
            .eq("id", responsibleId)
            .single();
          responsibleName = userData?.name || "Usuário desconhecido";
        }

        return {
          id: checklistData.id,
          title: checklistData.title || "Sem título",
          description: checklistData.description || "Sem descrição",
          createdAt: checklistData.created_at,
          updatedAt: checklistData.updated_at,
          status: checklistData.status || "ativo",
          status_checklist: checklistData.status_checklist,
          isTemplate: checklistData.is_template || false,
          userId: checklistData.user_id,
          companyId: checklistData.company_id,
          responsibleId,
          responsibleName,
          category: checklistData.category || "general",
          questions: processedQuestions,
          groups,
        } as Checklist & {
          questions: any[];
          groups: any[];
          responsibleName: string;
        };
      } catch (err) {
        console.error("Erro ao buscar dados do checklist:", err);
        throw new Error("Erro ao buscar checklist.");
      }
    },
    enabled: isValidUUID(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
