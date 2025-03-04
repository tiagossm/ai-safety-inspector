import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";
import { generateMockCollaborators } from "@/utils/checklistUtils";

export function useFetchChecklists() {
  return useQuery({
    queryKey: ["checklists"],
    queryFn: async () => {
      console.log("🔍 Buscando checklists...");

      // Buscar checklists com os novos campos
      const { data: checklists, error } = await supabase
        .from("checklists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro ao buscar checklists:", error);
        throw error;
      }

      console.log("✅ Checklists recebidos do Supabase:", checklists);

      // Obter os IDs dos responsáveis
      const responsibleIds = checklists
        .filter((c: any) => c.responsible_id)
        .map((c: any) => c.responsible_id);

      let usersMap: Record<string, string> = {};

      if (responsibleIds.length > 0) {
        try {
          const { data: users } = await supabase
            .from("users")
            .select("id, name")
            .in("id", responsibleIds);

          if (users) {
            usersMap = users.reduce((acc: Record<string, string>, user: any) => {
              acc[user.id] = user.name;
              return acc;
            }, {});
          }
        } catch (err) {
          console.error("❌ Erro ao buscar responsáveis:", err);
        }
      }

      // Adicionar informações aos checklists
      const checklistsWithItems = await Promise.all(
        checklists.map(async (checklist: any) => {
          try {
            const { count, error: itemsError } = await supabase
              .from("checklist_itens")
              .select("*", { count: "exact", head: true })
              .eq("checklist_id", checklist.id);

            if (itemsError) throw itemsError;

            // Garantir que os novos campos estão presentes
            const enrichedChecklist: Checklist = {
              ...checklist,
              items: count || 0,
              responsible_name: usersMap[checklist.responsible_id] || "Não atribuído",
              status_checklist: checklist.status_checklist === "inativo" ? "inativo" : "ativo",
              is_template: Boolean(checklist.is_template),
              category: checklist.category || "Sem categoria",
              due_date: checklist.due_date || null,
              collaborators: generateMockCollaborators(2),
              permissions: ["editor"],
            };

            return enrichedChecklist;
          } catch (err) {
            console.error(`❌ Erro ao buscar itens para checklist ${checklist.id}:`, err);
            return {
              ...checklist,
              items: 0,
              responsible_name: "Não atribuído",
              status_checklist: checklist.status_checklist === "inativo" ? "inativo" : "ativo",
              is_template: Boolean(checklist.is_template),
              category: checklist.category || "Sem categoria",
              due_date: checklist.due_date || null,
              collaborators: generateMockCollaborators(1),
              permissions: ["viewer"],
            };
          }
        })
      );

      return checklistsWithItems;
    },
  });
}
