
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useChecklistUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["checklist-users"],
    queryFn: async () => {
      console.log("Buscando usuários para checklist...");
      
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("status", "active")
        .order("name");
      
      if (error) {
        console.error("Erro ao buscar usuários:", error);
        return [];
      }
      
      console.log("Usuários encontrados:", data);
      return data || [];
    }
  });

  return {
    users,
    isLoading
  };
}
