import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const SessionChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingSession = async () => {
      console.log("🔍 Verificando sessão armazenada...");
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Erro ao recuperar sessão:", error);
        return;
      }

      if (data?.session?.user) {
        console.log("✅ Sessão válida encontrada, redirecionando...");
        await handleUserRedirect(data.session.user);
      } else {
        console.log("⚠️ Nenhuma sessão encontrada.");
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

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 Auth state changed: ${event}`);
        if (session?.user) {
          console.log("🔄 Usuário autenticado detectado, chamando handleUserRedirect...");
          await handleUserRedirect(session.user);
        }
      }
    );

    // 🚀 Chama a função para verificar se a sessão já existe antes de tudo
    checkExistingSession();

    checkSession();

    return () => {
      console.log("🔄 Removendo listener de autenticação...");
      authListener?.subscription?.unsubscribe?.();
    };
  }, []); // 🔹 Mantemos um array vazio para evitar loops desnecessários

  return null;
};
