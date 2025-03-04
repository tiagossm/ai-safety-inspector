import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";
import { generateMockCollaborators } from "@/utils/checklistUtils";
import { useAuth } from "@/components/AuthProvider";

export function useFetchChecklists() {
  // Obter o usuário estendido que possui os campos extras (como company_id, tier, role)
  const { user: extendedUser } = useAuth();

  return useQuery({
    queryKey: ["checklists"],
    queryFn: async () => {
      console.log("🔍 Buscando checklists...");

      if (!extendedUser) {
        throw new Error("Usuário não autenticado");
      }
      console.log("Usuário estendido:", extendedUser);

      // Verifica se o usuário é admin
      const isAdmin =
        extendedUser.tier === "super_admin" || extendedUser.role === "admin";
      console.log("Usuário é admin?", isAdmin);

      // Se o usuário não for admin e não tiver company_id, retorna um array vazio
      if (!isAdmin && !extendedUser.company_id) {
        console.warn("Nenhuma empresa associada ao usuário. Retornando lista vazia.");
        return [];
      }

      // Cria a query base
      let query = supabase
        .from("checklists")
        .select("*")
        .order("created_at", { ascending: false });

      // Se o usuário não for admin, aplica os filtros de user_id e company_id
      if (!isAdmin) {
        query = query.eq("user_id", extendedUser.id)
                     .eq("company_id", extendedUser.company_id);
      }

      const { data: checklists, error } = await query;
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

      // Enriquecer os checklists com informações adicionais
      const checklistsWithItems = await Promise.all(
        checklists.map(async (checklist: any) => {
          try {
            const { count, error: itemsError } = await supabase
              .from("checklist_itens")
              .select("*", { count: "exact", head: true })
              .eq("checklist_id", checklist.id);
            if (itemsError) throw itemsError;

            const enrichedChecklist: Checklist = {
              ...checklist,
              items: count || 0,
              responsible_name: usersMap[checklist.responsible_id] || "Não atribuído",
              status_checklist:
                checklist.status_checklist === "inativo" ? "inativo" : "ativo",
              is_template: Boolean(checklist.is_template),
              category: checklist.category || "Sem categoria",
              due_date: checklist.due_date || null,
              collaborators: generateMockCollaborators(isAdmin ? 2 : 1),
              permissions: isAdmin ? ["editor"] : ["viewer"],
            };
            return enrichedChecklist;
          } catch (err) {
            console.error(`❌ Erro ao buscar itens para checklist ${checklist.id}:`, err);
            return {
              ...checklist,
              items: 0,
              responsible_name: "Não atribuído",
              status_checklist:
                checklist.status_checklist === "inativo" ? "inativo" : "ativo",
              is_template: Boolean(checklist.is_template),
              category: checklist.category || "Sem categoria",
              due_date: checklist.due_date || null,
              collaborators: generateMockCollaborators(isAdmin ? 2 : 1),
              permissions: isAdmin ? ["editor"] : ["viewer"],
            };
          }
        })
      );

      return checklistsWithItems;
    },
  });
}
