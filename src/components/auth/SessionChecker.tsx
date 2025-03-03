import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export const SessionChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUserRedirect = async (user: any) => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("company_id, role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar perfil do usuário:", error);
          return;
        }

        if (!profile?.company_id) {
          navigate("/setup-company");
        } else {
          profile.role === "super_admin"
            ? navigate("/admin/dashboard")
            : navigate("/dashboard");
        }
      } catch (err) {
        console.error("Erro inesperado em handleUserRedirect:", err);
      }
    };

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro ao obter sessão:", error);
        return;
      }

      if (data?.session?.user) {
        await handleUserRedirect(data.session.user);
      }
    };

    const authListener = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await handleUserRedirect(session.user);
        }
      }
    );

    checkSession();

    return () => {
      authListener?.data?.subscription?.unsubscribe?.();
    };
  }, []); // 🔹 Removemos `handleUserRedirect` das dependências

  return null;
};
