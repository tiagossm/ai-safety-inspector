import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const SessionChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("✅ Supabase carregado:", supabase);

    const forceLogout = async () => {
      console.warn("⚠️ Sessão expirada ou inválida. Fazendo logout forçado...");

      await supabase.auth.signOut(); // 🔄 Encerra sessão no Supabase
      localStorage.clear(); // 🔥 Limpa todo o armazenamento local
      sessionStorage.clear(); // 🔥 Garante que dados temporários sejam apagados
      document.cookie.split(";").forEach((c) => { // 🔥 Remove todos os cookies armazenados
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      navigate("/login"); // 🔄 Redireciona para a tela de login
    };

    const checkSession = async () => {
      console.log("🔍 Verificando sessão do usuário...");

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          console.warn("⚠️ Nenhuma sessão válida encontrada. Executando logout...");
          await forceLogout();
          return;
        }

        console.log("✅ Sessão válida:", data);

        if (data.session.user) {
          console.log("🔄 Usuário autenticado:", data.session.user.id);
        }
      } catch (err) {
        console.error("❌ Erro inesperado ao verificar a sessão:", err);
      }
    };

    const sessionCheckInterval = setInterval(async () => {
      console.log("🔄 Verificando sessão ativa...");
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          console.warn("⚠️ Sessão inválida detectada. Fazendo logout...");
          await forceLogout();
        }
      } catch (err) {
        console.error("❌ Erro inesperado ao verificar sessão ativa:", err);
      }
    }, 5 * 60 * 1000); // 🔄 Verifica a sessão a cada 5 minutos

    checkSession();

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, []);

  return null;
};
