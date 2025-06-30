
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useChecklistUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .order("name");
      
      if (error) {
        console.error("Error fetching users:", error);
        return [];
      }
      
      return data || [];
    }
  });

  return {
    users,
    isLoading
  };
}
