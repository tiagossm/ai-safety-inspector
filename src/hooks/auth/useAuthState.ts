
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
            // Get additional user data from the users table
            const { data: userData, error: userDataError } = await supabase
              .from("users")
              .select("role, tier, company_id") 
              .eq("id", data.user.id)
              .single();
              
            if (userDataError) {
              console.error("Erro ao buscar dados complementares do usuário:", userDataError);
              
              // Check error message for missing column and provide default values
              const enhancedUser: AuthUser = {
                ...data.user,
                role: "user",
                tier: "technician",
                company_id: undefined
              };
              
              setUser(enhancedUser);
              setLoading(false);
              return;
            }
            
            // Create enhanced user with proper typing
            const enhancedUser: AuthUser = {
              ...data.user,
              role: userData?.role === "admin" ? "admin" : "user",
              tier: userData?.tier || "technician",
              company_id: userData?.company_id
            };
            
            setUser(enhancedUser);
          } catch (err) {
            console.error("Error fetching user data:", err);
            // Default user if exception occurs
            const enhancedUser: AuthUser = {
              ...data.user,
              role: "user",
              tier: "technician"
            };
            
            setUser(enhancedUser);
          }
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
