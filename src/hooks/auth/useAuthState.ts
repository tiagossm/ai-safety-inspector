
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
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            // Create enhanced user object
            const enhancedUser: AuthUser = {
              ...data.user,
              // Default values in case of error or missing data
              // Cast database role value to allowed type
              role: userError ? 'user' : (userData?.role === 'Administrador' ? 'admin' : 'user'),
              tier: userError ? 'technician' : (userData?.tier as any || 'technician'),
              company_id: userError ? undefined : userData?.company_id
            };

            setUser(enhancedUser);
          } catch (err) {
            console.error("Error fetching user data:", err);
            // Still set the basic user if there's an error
            setUser(data.user as AuthUser);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error in useAuthState:", err);
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
