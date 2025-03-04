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
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Erro ao buscar usuário:", error);
        setUser(null);
      } else {
        setUser(data.user as AuthUser);
      }
      setLoading(false);
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
