
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";
import { generateMockCollaborators } from "@/utils/checklistUtils";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useFetchChecklists() {
  const { user } = useAuth();
  const typedUser = user as AuthUser | null;
  
  return useQuery<Checklist[], Error>({
    queryKey: ["checklists"],
    queryFn: async () => {
      console.log("🔍 Buscando checklists...");

      try {
        // If there's no authenticated user, we can't fetch checklists
        if (!typedUser || !typedUser.id) {
          console.error("❌ Usuário não autenticado");
          throw new Error("Usuário não autenticado");
        }

        console.log("✅ Usuário autenticado:", typedUser.id);
        console.log("👤 Tipo de usuário:", typedUser.tier);

        // Determine if user is super_admin
        const isSuperAdmin = typedUser.tier === "super_admin";
        console.log("🔑 É super_admin?", isSuperAdmin);

        // Get user's company if not super_admin
        let company_id = null;
        if (!isSuperAdmin) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("company_id")
            .eq("id", typedUser.id)
            .single();

          if (userError) {
            console.error("❌ Erro ao buscar dados do usuário:", userError);
            // Don't throw error here to continue and try to fetch by user_id
          } else {
            company_id = userData?.company_id;
            console.log("✅ ID da empresa do usuário:", company_id);
          }
        }

        // Build the base query to fetch checklists
        let query = supabase
          .from("checklists")
          .select("*");

        // Super_admin sees all checklists, other users see only their own or company's
        if (!isSuperAdmin) {
          if (company_id) {
            // Fetch checklists of user's company or created by the user
            query = query.or(`user_id.eq.${typedUser.id},company_id.eq.${company_id}`);
            console.log("✅ Buscando checklists da empresa ou do usuário");
          } else {
            // If no company_id, fetch only user's checklists
            query = query.eq("user_id", typedUser.id);
            console.log("✅ Buscando apenas checklists do usuário");
          }
        } else {
          console.log("✅ Super_admin: buscando TODOS os checklists");
        }

        // Execute the query
        const { data: checklists, error } = await query.order("created_at", { ascending: false });

        if (error) {
          console.error("❌ Erro ao buscar checklists:", error);
          throw error;
        }

        console.log("✅ Checklists recebidos do Supabase:", checklists?.length || 0);

        // If no checklists, return empty array
        if (!checklists || checklists.length === 0) {
          console.log("❓ Nenhum checklist encontrado para o usuário");
          return [];
        }

        // Get the names of responsible persons
        let usersMap: Record<string, string> = {};
        const responsibleIds = checklists
          .filter((c: any) => c.responsible_id)
          .map((c: any) => c.responsible_id);

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

        // Get company information
        let companiesMap: Record<string, string> = {};
        const companyIds = checklists
          .filter((c: any) => c.company_id)
          .map((c: any) => c.company_id);

        if (companyIds.length > 0) {
          try {
            const { data: companies } = await supabase
              .from("companies")
              .select("id, name, fantasy_name")
              .in("id", companyIds);

            if (companies) {
              companiesMap = companies.reduce((acc: Record<string, string>, company: any) => {
                acc[company.id] = company.fantasy_name || company.name || "Empresa sem nome";
                return acc;
              }, {});
            }
          } catch (err) {
            console.error("❌ Erro ao buscar empresas:", err);
          }
        }

        // Add complementary information to checklists
        const checklistsWithItems = await Promise.all(
          checklists.map(async (checklist: any) => {
            try {
              // Count total items
              const { count, error: itemsError } = await supabase
                .from("checklist_itens")
                .select("*", { count: "exact", head: true })
                .eq("checklist_id", checklist.id);

              if (itemsError) throw itemsError;

              // Count completed items
              const { count: completedCount, error: completedError } = await supabase
                .from("checklist_itens")
                .select("*", { count: "exact", head: true })
                .eq("checklist_id", checklist.id)
                .not("tipo_resposta", "is", null);
                
              if (completedError) throw completedError;

              // Enrich checklist with new fields
              const enrichedChecklist: Checklist = {
                ...checklist,
                items: count || 0,
                items_completed: completedCount || 0,
                responsible_name: usersMap[checklist.responsible_id] || "Não atribuído",
                company_name: companiesMap[checklist.company_id] || "Não atribuída",
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
                items_completed: 0,
                responsible_name: "Não atribuído",
                company_name: "Não atribuída",
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
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 2, // Retry failed requests twice
  });
}
