
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// Interface estendida para o User
export interface AuthUser extends User {
  role?: "admin" | "user";
  tier?: "super_admin" | "company_admin" | "consultant" | "technician";
  company_id?: string;
}

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Erro ao buscar usuário:", error);
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (data.user) {
          // Buscar informações adicionais do usuário, incluindo company_id
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, tier, company_id")
            .eq("id", data.user.id)
            .single();
            
          if (userError) {
            console.error("Erro ao buscar dados complementares do usuário:", userError);
          }
          
          // Criar usuário estendido com tipagem correta
          const enhancedUser: AuthUser = {
            ...data.user,
            role: userData?.role === "admin" ? "admin" : "user",
            tier: userData?.tier || "technician",
            company_id: userData?.company_id
          };
          
          setUser(enhancedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erro inesperado ao buscar usuário:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return {
    user,
    setUser,
    loading,
    setLoading,
  };
}
