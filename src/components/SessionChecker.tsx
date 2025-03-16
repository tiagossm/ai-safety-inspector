
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SessionChecker = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
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
          toast.error("Não foi possível verificar sua sessão. Tente novamente.");

          if (!isPublicPath(location.pathname)) {
            navigate("/auth");
          }

          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        if (!data || !data.session) {
          console.log("🔄 Nenhuma sessão encontrada");
          setSession(null);
          
          if (!isPublicPath(location.pathname)) {
            console.log("🔄 Redirecionando para página de autenticação...");
            navigate("/auth");
          }
          
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        // Check if token is close to expiration (within 5 minutes)
        const expiresAt = data.session.expires_at ? data.session.expires_at * 1000 : 0;
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (expiresAt && expiresAt - now < fiveMinutes) {
          console.log("⚠️ Token próximo do vencimento, refreshing...");
          await supabase.auth.refreshSession();
        }

        console.log("✅ Sessão encontrada:", data.session.user?.email);
        setSession(data.session);
        setIsLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error("❌ Erro inesperado:", error);
        setIsLoading(false);
        setIsInitialized(true);
        setSession(null);
        
        if (!isPublicPath(location.pathname)) {
          navigate("/auth");
        }
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
        if (!isPublicPath(location.pathname)) {
          navigate("/auth");
        }
      }

      setIsLoading(false);
      setIsInitialized(true);
    });

    // Set up a refresh timer to regularly check and refresh the token
    const intervalId = setInterval(async () => {
      if (session) {
        try {
          console.log("🔄 Verificando e atualizando token...");
          await supabase.auth.refreshSession();
        } catch (error) {
          console.error("❌ Erro ao atualizar token:", error);
        }
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    return () => {
      console.log("🔄 Desmontando SessionChecker");
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [location.pathname, navigate]);

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
