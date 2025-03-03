import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const SessionChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const forceLogout = async () => {
      console.warn("⚠️ Sessão expirada ou inválida. Fazendo logout...");
      await supabase.auth.signOut(); // 🔄 Encerra a sessão completamente
      localStorage.clear(); // 🔥 Remove todos os dados armazenados no navegador
      navigate("/login"); // 🔄 Redireciona para o login
    };

    const checkSession = async () => {
      try {
        console.log("🔍 Verificando sessão do usuário...");
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          await forceLogout();
          return;
        }

        console.log("✅ Sessão válida:", data);

        if (data.session.user) {
          console.log("🔄 Usuário autenticado:", data.session.user.id);
        }
      } catch (err) {
        console.error("❌ Erro inesperado em checkSession:", err);
      }
    };

    const sessionCheckInterval = setInterval(async () => {
      console.log("🔄 Verificando sessão ativa...");
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        await forceLogout();
      }
    }, 5 * 60 * 1000); // 🔄 Verifica a sessão a cada 5 minutos

    checkSession();

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, []);

  return null;
};
