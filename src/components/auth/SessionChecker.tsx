import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const SessionChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const refreshSession = async () => {
      console.log("🔄 Tentando atualizar sessão...");
      const { error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("❌ Erro ao atualizar sessão:", error);
      } else {
        console.log("✅ Sessão atualizada com sucesso!");
      }
    };

    const handleUserRedirect = async (user: any) => {
      try {
        console.log("🔍 Buscando perfil do usuário:", user.id);

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("company_id, role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("❌ Erro ao buscar perfil do usuário:", error);
          return;
        }

        console.log("✅ Perfil do usuário recuperado:", profile);

        if (!profile?.company_id) {
          console.log("⚠️ Usuário sem empresa associada. Redirecionando para /setup-company");
          navigate("/setup-company");
        } else {
          console.log(`✅ Usuário autenticado como ${profile.role}. Redirecionando...`);
          profile.role === "super_admin"
            ? navigate("/admin/dashboard")
            : navigate("/dashboard");
        }
      } catch (err) {
        console.error("❌ Erro inesperado em handleUserRedirect:", err);
      }
    };

    const checkSession = async () => {
      try {
        console.log("🔍 Verificando sessão do usuário...");
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Erro ao obter sessão:", error);
          return;
        }

        console.log("✅ Sessão recuperada do Supabase:", data);

        if (data?.session?.user) {
          console.log("🔄 Chamando handleUserRedirect...");
          await handleUserRedirect(data.session.user);
        } else {
          console.log("⚠️ Nenhum usuário autenticado.");
        }
      } catch (err) {
        console.error("❌ Erro inesperado em checkSession:", err);
      }
    };

    const startSessionCheck = async () => {
      await refreshSession(); // 🚀 Atualiza a sessão antes de verificar
      await checkSession();
    };

    const checkSessionPeriodically = () => {
      const interval = setInterval(async () => {
        console.log("🔄 Verificando sessão ativa...");
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          console.warn("⚠️ Sessão expirada ou inválida. Fazendo logout...");
          
          // 🚀 Garante que a sessão será completamente encerrada antes de redirecionar
          await supabase.auth.signOut();
          navigate("/login");
        }
      }, 5 * 60 * 1000); // 🔄 Verifica a sessão a cada 5 minutos

      return interval;
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 Auth state changed: ${event}`);
        if (session?.user) {
          console.log("🔄 Usuário autenticado detectado, chamando handleUserRedirect...");
          await handleUserRedirect(session.user);
        }
      }
    );

    startSessionCheck();
    const sessionCheckInterval = checkSessionPeriodically();

    return () => {
      console.log("🔄 Removendo listener de autenticação...");
      authListener?.subscription?.unsubscribe?.();
      clearInterval(sessionCheckInterval);
    };
  }, []);

  return null;
};
