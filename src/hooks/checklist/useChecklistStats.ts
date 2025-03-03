
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface ChecklistStats {
  total: number;
  active: number;
  inactive: number;
  templates: number;
  byCategory: Record<string, number>;
}

export function useChecklistStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["checklist-stats"],
    queryFn: async (): Promise<ChecklistStats> => {
      const stats: ChecklistStats = {
        total: 0,
        active: 0,
        inactive: 0,
        templates: 0,
        byCategory: {}
      };
      
      // Obter todos os checklists
      const { data: checklists, error } = await supabase
        .from("checklists")
        .select("*");
      
      if (error) {
        console.error("Erro ao buscar estatísticas de checklists:", error);
        return stats;
      }
      
      if (!checklists || checklists.length === 0) {
        return stats;
      }
      
      // Calcular estatísticas
      stats.total = checklists.length;
      stats.active = checklists.filter(c => c.status_checklist === "ativo").length;
      stats.inactive = checklists.filter(c => c.status_checklist === "inativo").length;
      stats.templates = checklists.filter(c => c.is_template).length;
      
      // Calcular por categoria
      checklists.forEach(checklist => {
        const category = checklist.category || "general";
        if (!stats.byCategory[category]) {
          stats.byCategory[category] = 0;
        }
        stats.byCategory[category]++;
      });
      
      return stats;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
