
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist, ChecklistWithStats } from "@/types/newChecklist";
import { toast } from "sonner";

/**
 * Hook to fetch all checklists with optional stats
 */
export function useChecklistFetch() {
  return useQuery({
    queryKey: ["new-checklists"],
    queryFn: async (): Promise<ChecklistWithStats[]> => {
      console.log("Fetching all checklists");
      
      const { data, error } = await supabase
        .from("checklists")
        .select(`
          id,
          title,
          description,
          is_template as isTemplate,
          status_checklist as status,
          category,
          responsible_id as responsibleId,
          company_id as companyId,
          user_id as userId,
          created_at as createdAt,
          updated_at as updatedAt,
          due_date as dueDate
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching checklists:", error);
        toast.error("Erro ao carregar checklists");
        throw error;
      }

      if (!data) {
        return [];
      }

      // Transform the data to our new format
      const checklists: ChecklistWithStats[] = await Promise.all(
        data.map(async (checklistItem) => {
          // Get count of questions for each checklist
          const { count: totalQuestions, error: countError } = await supabase
            .from("checklist_itens")
            .select("*", { count: "exact", head: true })
            .eq("checklist_id", checklistItem.id);

          if (countError) {
            console.error(`Error counting questions for checklist ${checklistItem.id}:`, countError);
          }

          return {
            ...checklistItem,
            totalQuestions: totalQuestions || 0,
            completedQuestions: 0 // We'll need another query for this in a real app
          };
        })
      );

      return checklists;
    },
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
}
