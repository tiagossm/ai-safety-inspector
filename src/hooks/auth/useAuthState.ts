
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
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          console.error("⚠️ Erro ao obter a sessão:", error);
          setUser(null);
          setLoading(false);
          return;
        }

        const sessionUser = data.session.user;
        if (!sessionUser) {
          console.warn("⚠️ Nenhum usuário na sessão!");
          setUser(null);
          setLoading(false);
          return;
        }

        console.log("✅ Sessão carregada com usuário:", sessionUser.email);

        try {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, tier, company_id")
            .eq("id", sessionUser.id)
            .maybeSingle(); // Using maybeSingle instead of single to prevent errors

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
            ...sessionUser,
            role,
            tier,
            company_id: userData?.company_id || undefined,
          };

          console.log("✅ Usuário final carregado:", enhancedUser);
          setUser(enhancedUser);
        } catch (err) {
          console.error("❌ Erro ao buscar dados do usuário no banco:", err);
          setUser({
            ...sessionUser,
            role: "user", // Padrão para evitar erros
            tier: "technician",
          });
        }
      } catch (err) {
        console.error("❌ Erro inesperado em useAuthState:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Set up auth subscription to detect changes in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchUser(); // Refresh user data
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    setUser,
    loading,
    setLoading,
  };
}
