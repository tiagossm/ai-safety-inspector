import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SessionChecker = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null); // ✅ Corrigido: Definição correta da session
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

        if (!data || !data.session) {
          console.log("🔄 Nenhuma sessão encontrada, redirecionando...");
          setSession(null);
          navigate("/auth");
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        console.log("✅ Sessão encontrada:", data.session);
        setSession(data.session);
        setIsLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error("❌ Erro inesperado:", error);
        setIsLoading(false);
        setIsInitialized(true);
        setSession(null);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("🔄 Estado de autenticação alterado:", event);
      setSession(newSession);
      
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
