
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist } from "@/types/checklist";

export function useFetchChecklistData(id: string) {
  return useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      console.log("Fetching checklist data for ID:", id);
      
      if (!id) {
        throw new Error("Checklist ID is required");
      }
      
      const { data: checklistData, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar checklist:", error);
        throw error;
      }

      console.log("Raw checklist data:", checklistData);

      // Fetch responsible user name if there's an ID
      let responsibleName = null;
      
      // Access responsible_id safely with type assertion
      const rawData = checklistData as any;
      const responsibleId = rawData.responsible_id || null;
      
      if (responsibleId) {
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', responsibleId)
          .single();

        if (userData) {
          responsibleName = userData.name;
        }
      }

      // Ensure we return a correctly typed Checklist object
      return {
        id: checklistData.id,
        title: checklistData.title,
        description: checklistData.description,
        created_at: checklistData.created_at,
        updated_at: checklistData.updated_at,
        status_checklist: checklistData.status_checklist as "ativo" | "inativo",
        is_template: Boolean(checklistData.is_template),
        user_id: checklistData.user_id,
        company_id: checklistData.company_id,
        status: checklistData.status,
        // Access category safely with type assertion
        category: (rawData.category !== undefined) ? rawData.category : undefined,
        responsible_id: responsibleId,
        responsible_name: responsibleName
      } as Checklist;
    },
    enabled: !!id,
    // Add caching and retry configuration
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: (failureCount, error) => {
      // Retry 3 times with exponential backoff for network errors
      if (failureCount < 3) {
        console.log(`Retry attempt ${failureCount + 1} for checklist query`);
        return true;
      }
      return false;
    },
  });
}
