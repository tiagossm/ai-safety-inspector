import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// Interface estendida para o User
export interface AuthUser extends User {
  role?: "super_admin" | "company_admin" | "consultant" | "technician" | "user";
  tier?: string;
  company_id?: string;
}

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("🔍 Buscando usuário autenticado...");
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("❌ Erro ao buscar usuário:", error);
          setUser(null);
          setLoading(false);
          return;
        }

        if (data.user) {
          console.log("✅ Usuário autenticado:", data.user.email);
          
          try {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("role, tier, company_id")
              .eq("id", data.user.id)
              .single();

            if (userError) {
              console.error("⚠️ Erro ao buscar dados do usuário:", userError);
            }

            console.log("🔍 Dados do usuário no banco:", userData);

            // Correção da role para garantir que "Administrador" seja "super_admin"
            let role: AuthUser["role"] = "user"; // Padrão
            if (userData?.role === "Administrador") {
              role = "super_admin"; // 🔴 Aqui garantimos que "Administrador" seja reconhecido corretamente
            } else if (userData?.role === "Company_Admin") {
              role = "company_admin";
            } else if (userData?.role === "Consultor") {
              role = "consultant";
            } else if (userData?.role === "Técnico") {
              role = "technician";
            }

            // Ajuste para garantir que tier seja coerente
            let tier: string = userData?.tier || role; // 🔴 Se o tier não existir, assume a role

            const enhancedUser: AuthUser = {
              ...data.user,
              role,
              tier,
              company_id: userData?.company_id || undefined,
            };

            console.log("✅ Usuário final carregado:", enhancedUser);
            setUser(enhancedUser);
          } catch (err) {
            console.error("❌ Erro ao buscar dados do usuário no banco:", err);
            setUser({
              ...data.user,
              role: "user", // Padrão para evitar erros
              tier: "technician",
            });
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Erro inesperado em useAuthState:", err);
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
