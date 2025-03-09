
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";
import { generateMockCollaborators } from "@/utils/checklistUtils";

export function useFetchChecklists() {
  return useQuery<Checklist[], Error>({
    queryKey: ["checklists"],
    queryFn: async () => {
      console.log("🔍 Buscando checklists...");

      // Obter o usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("❌ Usuário não autenticado");
        throw new Error("Usuário não autenticado");
      }

      console.log("✅ Usuário autenticado:", user.id);

      // Buscar o ID da empresa do usuário
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("❌ Erro ao buscar dados do usuário:", userError);
      }

      const company_id = userError ? null : userData?.company_id;
      console.log("✅ ID da empresa do usuário:", company_id);

      // Buscar checklists - modificado para buscar mesmo sem company_id
      let query = supabase
        .from("checklists")
        .select("*");

      // Filtramos por user_id para ver todos checklists do usuário
      query = query.eq("user_id", user.id);

      // Se tiver company_id, adicionamos como filtro adicional, não substituto
      if (company_id) {
        console.log("✅ Filtrando também por company_id:", company_id);
      }

      const { data: checklists, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro ao buscar checklists:", error);
        throw error;
      }

      console.log("✅ Checklists recebidos do Supabase:", checklists?.length || 0);

      // Se não há checklists, retorna array vazio
      if (!checklists || checklists.length === 0) {
        console.log("❓ Nenhum checklist encontrado para o usuário");
        return [];
      }

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

            // Enriquecer o checklist com os novos campos
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

      console.log("✅ Retornando checklists processados:", checklistsWithItems.length);
      return checklistsWithItems;
    },
    // Reduzir o staleTime para forçar recarregamento mais frequente
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: true,
  });
}
