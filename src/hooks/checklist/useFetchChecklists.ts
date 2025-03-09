
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";
import { generateMockCollaborators } from "@/utils/checklistUtils";
import { toast } from "sonner";

export function useFetchChecklists() {
  return useQuery<Checklist[], Error>({
    queryKey: ["checklists"],
    queryFn: async () => {
      console.log("🔍 Buscando checklists...");

      try {
        // Get the authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error("❌ Erro de autenticação:", authError);
          throw new Error("Erro de autenticação: " + authError.message);
        }
        
        if (!user) {
          console.error("❌ Usuário não autenticado");
          throw new Error("Usuário não autenticado");
        }

        console.log("✅ Usuário autenticado:", user.id);

        // Fetch the user's company ID
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("company_id")
          .eq("id", user.id)
          .single();

        if (userError) {
          console.error("❌ Erro ao buscar dados do usuário:", userError);
          // Not throwing here as we can still try to get checklists by user_id
        }

        const company_id = userError ? null : userData?.company_id;
        console.log("✅ ID da empresa do usuário:", company_id);

        // Build the query to fetch checklists
        let query = supabase
          .from("checklists")
          .select("*");

        // Filter by user_id to see all checklists created by this user
        query = query.eq("user_id", user.id);

        // If we have company_id, add it as an additional filter, not a substitute
        if (company_id) {
          console.log("✅ Filtrando também por company_id:", company_id);
        }

        const { data: checklists, error } = await query.order("created_at", { ascending: false });

        if (error) {
          console.error("❌ Erro ao buscar checklists:", error);
          throw error;
        }

        console.log("✅ Checklists recebidos do Supabase:", checklists?.length || 0);

        // Verify each checklist has an ID
        if (checklists) {
          for (const checklist of checklists) {
            if (!checklist.id) {
              console.error("❌ Checklist sem ID detectado:", checklist);
            }
          }
        }

        // If no checklists, return empty array
        if (!checklists || checklists.length === 0) {
          console.log("❓ Nenhum checklist encontrado para o usuário");
          return [];
        }

        // Get IDs of responsible users
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

        // Add information to checklists
        const checklistsWithItems = await Promise.all(
          checklists.map(async (checklist: any) => {
            try {
              const { count, error: itemsError } = await supabase
                .from("checklist_itens")
                .select("*", { count: "exact", head: true })
                .eq("checklist_id", checklist.id);

              if (itemsError) throw itemsError;

              // Enrich the checklist with new fields
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
      } catch (error) {
        console.error("❌ Erro fatal ao buscar checklists:", error);
        toast.error("Erro ao carregar checklists", {
          description: "Verifique sua conexão e tente novamente",
          duration: 4000
        });
        throw error;
      }
    },
    // Reduce staleTime to force more frequent reloading
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 2, // Retry failed requests twice
  });
}
