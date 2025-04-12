
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";
import { toast } from "sonner";

interface UseLocalChecklistsParams {
  search: string;
  page: number;
  perPage: number;
  sort: "asc" | "desc";
  sortColumn: string;
}

interface UseLocalChecklistsReturn {
  checklists: ChecklistWithStats[];
  loading: boolean;
  error: string;
  refetch: () => void;
  total: number;
}

export const useLocalChecklists = ({
  search,
  page,
  perPage,
  sort,
  sortColumn,
}: UseLocalChecklistsParams): UseLocalChecklistsReturn => {
  const [checklists, setChecklists] = useState<ChecklistWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      // Consulta básica dos checklists sem joins para evitar problemas de relacionamento
      let query = supabase
        .from("checklists")
        .select("*", { count: "exact" });

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      if (sortColumn) {
        query = query.order(sortColumn, { ascending: sort === "asc" });
      }

      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Processar os checklists e buscar dados relacionados separadamente
      const processedChecklists = await Promise.all(
        (data || []).map(async (checklist) => {
          // Buscar o nome da empresa
          let companyName = "";
          if (checklist.company_id) {
            const { data: companyData } = await supabase
              .from("companies")
              .select("fantasy_name")
              .eq("id", checklist.company_id)
              .single();
            companyName = companyData?.fantasy_name || "";
          }

          // Buscar o nome do criador
          let createdByName = "Usuário do sistema";
          if (checklist.user_id) {
            const { data: userData } = await supabase
              .from("users")
              .select("name")
              .eq("id", checklist.user_id)
              .single();
            createdByName = userData?.name || "Usuário do sistema";
          }

          return {
            id: checklist.id,
            title: checklist.title,
            description: checklist.description,
            status: checklist.status_checklist === "ativo" ? "active" : "inactive",
            category: checklist.category,
            isTemplate: checklist.is_template,
            companyId: checklist.company_id,
            companyName,
            createdAt: checklist.created_at,
            updatedAt: checklist.updated_at,
            responsibleId: checklist.responsible_id,
            userId: checklist.user_id,
            createdByName,
            totalQuestions: 0, // Será carregado em uma consulta separada
            completedQuestions: 0,
            questions: [],
            groups: [],
            origin: checklist.origin as "manual" | "ia" | "csv",
          };
        })
      );

      // Para cada checklist, buscar contagem de questões
      const checklistsWithQuestionCounts = await Promise.all(
        processedChecklists.map(async (checklist) => {
          const { count: questionCount } = await supabase
            .from("checklist_itens")
            .select("*", { count: "exact", head: true })
            .eq("checklist_id", checklist.id);

          return {
            ...checklist,
            totalQuestions: questionCount || 0
          };
        })
      );

      setChecklists(checklistsWithQuestionCounts);
      setTotal(count || 0);
    } catch (err: any) {
      console.error("Error fetching checklists:", err);
      setError(err.message || "Error fetching checklists");
      toast.error("Erro ao carregar checklists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, [search, page, perPage, sort, sortColumn]);

  return {
    checklists,
    loading,
    error,
    refetch: fetchChecklists,
    total,
  };
};
