
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";
import { generateMockCollaborators } from "@/utils/checklistUtils";
import { toast } from "sonner";
import { AuthUser } from "@/hooks/auth/useAuthState";

/**
 * Fetches checklist data from Supabase based on user permissions
 */
export async function fetchChecklistsData(user: AuthUser | null) {
  console.log("🔍 Buscando checklists...");

  try {
    // Se não há usuário autenticado, não podemos buscar checklists
    if (!user || !user.id) {
      console.error("❌ Usuário não autenticado");
      throw new Error("Usuário não autenticado");
    }

    console.log("✅ Usuário autenticado:", user.id);
    console.log("👤 Tipo de usuário:", user.tier);

    // Determina se o usuário é super_admin
    const isSuperAdmin = user.tier === "super_admin";
    console.log("🔑 É super_admin?", isSuperAdmin);

    // Buscar dados da empresa do usuário se não for super_admin
    let company_id = null;
    if (!isSuperAdmin) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("❌ Erro ao buscar dados do usuário:", userError);
        // Não lançamos erro para continuar e tentar buscar por user_id
      } else {
        company_id = userData?.company_id;
        console.log("✅ ID da empresa do usuário:", company_id);
      }
    }

    // Constrói a query base para buscar checklists
    let query = supabase
      .from("checklists")
      .select("*");

    // Super_admin vê todos os checklists, outros usuários veem apenas os próprios ou da empresa
    if (!isSuperAdmin) {
      if (company_id) {
        // Buscar checklists da empresa do usuário ou criados pelo próprio usuário
        query = query.or(`user_id.eq.${user.id},company_id.eq.${company_id}`);
        console.log("✅ Buscando checklists da empresa ou do usuário");
      } else {
        // Se não tem company_id, busca apenas checklists criados pelo usuário
        query = query.eq("user_id", user.id);
        console.log("✅ Buscando apenas checklists do usuário");
      }
    } else {
      console.log("✅ Super_admin: buscando TODOS os checklists");
    }

    // Execute a query
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

    return checklists;
  } catch (error) {
    console.error("❌ Erro fatal ao buscar checklists:", error);
    toast.error("Erro ao carregar checklists", {
      description: "Verifique sua conexão e tente novamente",
      duration: 4000
    });
    throw error;
  }
}

/**
 * Fetches additional data (responsible users and companies) for checklists
 */
export async function fetchChecklistRelatedData(checklists: any[]) {
  // Maps to store user and company data
  let usersMap: Record<string, string> = {};
  let companiesMap: Record<string, string> = {};

  // Fetch responsible users
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

  // Fetch company information
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

  return { usersMap, companiesMap };
}

/**
 * Enriches checklists with item counts and other details
 */
export async function enrichChecklistsWithItems(checklists: any[], usersMap: Record<string, string>, companiesMap: Record<string, string>) {
  return Promise.all(
    checklists.map(async (checklist: any) => {
      try {
        // Count all items
        const { count, error: itemsError } = await supabase
          .from("checklist_itens")
          .select("*", { count: "exact", head: true })
          .eq("checklist_id", checklist.id);

        if (itemsError) throw itemsError;

        // For now, set completedCount to 0
        const completedCount = 0;

        // Enriquece o checklist com novos campos
        const enrichedChecklist: Checklist = {
          ...checklist,
          items: count || 0,
          items_completed: completedCount,
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
}
