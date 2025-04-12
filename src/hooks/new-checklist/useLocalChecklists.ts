
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
      let query = supabase
        .from("checklists")
        .select("*, companies(fantasy_name), users(name)", { count: "exact" });

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

      const transformedData: ChecklistWithStats[] = data.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status_checklist === "ativo" ? "active" : "inactive",
        category: item.category,
        isTemplate: item.is_template,
        companyId: item.company_id,
        companyName: item.companies?.fantasy_name || "",
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        responsibleId: item.responsible_id,
        userId: item.user_id,
        // Access the creator name directly from users instead of profiles
        createdByName: item.users?.name || "Usuário do sistema",
        totalQuestions: 0,
        completedQuestions: 0,
        questions: [],
        groups: [],
        origin: item.origin as "manual" | "ia" | "csv",
      }));

      setChecklists(transformedData);
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
