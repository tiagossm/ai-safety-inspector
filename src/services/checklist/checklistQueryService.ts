
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats } from "@/types/newChecklist";
import { transformDbChecklistsToStats } from "./checklistTransformers";

export const useChecklistsQuery = () => {
  return useQuery({
    queryKey: ["checklists"],
    queryFn: async (): Promise<ChecklistWithStats[]> => {
      const { data, error } = await supabase
        .from("checklists")
        .select(`
          *,
          companies:company_id (id, fantasy_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match the expected format
      return transformDbChecklistsToStats(data || []);
    }
  });
};

export const useChecklistByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ["checklist", id],
    queryFn: async (): Promise<ChecklistWithStats> => {
      const { data, error } = await supabase
        .from("checklists")
        .select(`
          *,
          companies:company_id (id, fantasy_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Get question count
      const { count: totalQuestions, error: countError } = await supabase
        .from("checklist_itens")
        .select("*", { count: "exact", head: true })
        .eq("checklist_id", id);

      if (countError) {
        console.error("Error fetching question count:", countError);
      }
      
      // Transform to the expected format
      const result = {
        ...data,
        totalQuestions: totalQuestions || 0,
        completedQuestions: 0,
        companyName: data.companies?.fantasy_name || "",
      };
      
      return transformDbChecklistsToStats([result])[0];
    },
    enabled: !!id
  });
};
