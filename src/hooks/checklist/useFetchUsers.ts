
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserBasic {
  id: string;
  name: string;
}

export function useFetchUsers(companyId?: string) {
  return useQuery<UserBasic[], Error>({
    queryKey: ["users", companyId],
    queryFn: async (): Promise<UserBasic[]> => {
      console.log("Fetching users for responsible selection");
      
      // Base query to get users
      let query = supabase
        .from("users")
        .select("id, name")
        .eq("status", "active");
      
      // Filter by company if provided
      if (companyId) {
        console.log("Filtering users by company_id:", companyId);
        query = query.eq("company_id", companyId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching users:", error);
        return [];
      }
      
      return (data || []) as UserBasic[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
