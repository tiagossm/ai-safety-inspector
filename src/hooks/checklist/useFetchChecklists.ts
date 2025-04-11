
import { useQuery } from "@tanstack/react-query";
import { Checklist } from "@/types/checklist";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";
import { 
  fetchChecklistsData, 
  fetchChecklistRelatedData, 
  enrichChecklistsWithItems 
} from "@/services/checklist/checklistFetchService";

/**
 * Hook for fetching and processing checklists
 */
export function useFetchChecklists() {
  const { user } = useAuth();
  const typedUser = user as AuthUser | null;
  
  return useQuery<Checklist[], Error>({
    queryKey: ["checklists"],
    queryFn: async () => {
      try {
        // Step 1: Fetch basic checklist data
        const checklists = await fetchChecklistsData(typedUser);
        
        if (!checklists || checklists.length === 0) {
          return [];
        }

        // Step 2: Fetch related data (users and companies)
        const { usersMap, companiesMap } = await fetchChecklistRelatedData(checklists);
        
        // Step 3: Enrich checklists with items count and other details
        const enrichedChecklists = await enrichChecklistsWithItems(checklists, usersMap, companiesMap);
        
        console.log("✅ Retornando checklists processados:", enrichedChecklists.length);
        return enrichedChecklists;
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
