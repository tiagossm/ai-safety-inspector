import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SessionChecker = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedSession, setHasCheckedSession] = useState(false); // ✅ Evita múltiplas verificações
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("✅ SessionChecker montado (URL atual:", location.pathname, ")");

    const isPublicPath = (path: string): boolean => {
      return (
        path === "/" ||
        path === "/auth" ||
        path === "/plans" ||
        path === "/blog" ||
        path === "/contact" ||
        path.startsWith("/public/")
      );
    };

    const checkSession = async () => {
      if (hasCheckedSession) return; // ✅ Impede verificações repetidas 🚀

      try {
        console.log("🔍 Verificando sessão do usuário...");
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Erro ao verificar sessão:", error);
          toast.error("Não foi possível verificar sua sessão");

          if (!isPublicPath(location.pathname)) {
            navigate("/auth");
          }

          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        const session = data.session;
        console.log("ℹ️ Status da sessão:", session ? "Autenticado" : "Não autenticado");

        if (!session && !isPublicPath(location.pathname)) {
          console.log("🔄 Redirecionando para tela de login");
          navigate("/auth");
        }

        setIsLoading(false);
        setIsInitialized(true);
        setHasCheckedSession(true); // ✅ Evita que a verificação rode várias vezes 🚀
      } catch (error) {
        console.error("❌ Erro inesperado:", error);
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    if (!hasCheckedSession) {
      checkSession();
    }

    // ✅ Mantendo o listener de mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Estado de autenticação alterado:", event);

      if (event === "SIGNED_IN") {
        console.log("✅ Usuário autenticado");
        if (location.pathname === "/auth") {
          navigate("/dashboard");
        }
      } else if (event === "SIGNED_OUT") {
        console.log("ℹ️ Usuário desconectado");
        navigate("/auth");
      }

      setIsLoading(false);
      setIsInitialized(true);
    });

    return () => {
      console.log("🔄 Desmontando SessionChecker");
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Inicializando aplicação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionChecker;
