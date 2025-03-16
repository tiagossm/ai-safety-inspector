
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SessionChecker = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log("✅ SessionChecker montado (URL atual:", location.pathname, ")");
    
    // Função para verificar se um caminho é público
    const isPublicPath = (path: string): boolean => {
      return path === "/" || 
             path === "/auth" ||
             path === "/plans" || 
             path === "/blog" || 
             path === "/contact" ||
             path.startsWith("/public/");
    };
    
    // Função para verificar a sessão atual
    const checkSession = async () => {
      try {
        console.log("🔍 Tentando obter sessão do usuário...");
        
        // Obtém a sessão atual
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Erro ao verificar sessão:", error);
          
          // Check if the error is related to API keys
          if (error.message.includes('Invalid API key')) {
            toast.error("Erro de configuração do servidor", {
              description: "Por favor, tente novamente em alguns instantes ou contate o suporte."
            });
          } else {
            toast.error("Não foi possível verificar sua sessão", {
              description: error.message
            });
          }
          
          if (!isPublicPath(location.pathname)) {
            navigate("/auth");
          }
          
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }
        
        const session = data.session;
        console.log("ℹ️ Status da sessão:", session ? "Autenticado" : "Não autenticado");
        
        // Verificar se a sessão está expirada
        if (session && session.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          if (expiresAt < new Date()) {
            console.log("⚠️ Sessão expirada, redirecionando para login");
            await supabase.auth.signOut();
            if (!isPublicPath(location.pathname)) {
              navigate("/auth");
              toast.error("Sua sessão expirou. Por favor, faça login novamente.");
            }
          }
        }
        
        // Se não houver sessão e não estiver em uma rota pública, redirecione para /auth
        if (!session && !isPublicPath(location.pathname)) {
          console.log("🔄 Redirecionando para tela de login");
          navigate("/auth");
        }
        
        setIsLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error("❌ Erro inesperado:", error);
        toast.error("Erro ao verificar sessão", {
          description: "Ocorreu um erro inesperado. Tente novamente."
        });
        setIsLoading(false);
        setIsInitialized(true);
        
        if (!isPublicPath(location.pathname)) {
          navigate("/auth");
        }
      }
    };
    
    // Apenas execute a verificação se o componente não estiver inicializado
    if (!isInitialized) {
      checkSession();
    }
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Estado de autenticação alterado:", event);
      
      if (event === "SIGNED_IN") {
        console.log("✅ Usuário acabou de autenticar-se");
        
        // Se estiver na página de auth, redirecione para o dashboard
        if (location.pathname === "/auth") {
          navigate("/dashboard");
        }
      } else if (event === "SIGNED_OUT") {
        console.log("ℹ️ Usuário desconectado");
        navigate("/auth");
      } else if (event === "TOKEN_REFRESHED") {
        console.log("♻️ Token atualizado com sucesso");
      } else if (event === "USER_UPDATED") {
        console.log("📝 Dados do usuário atualizados");
      }
      
      setIsLoading(false);
      setIsInitialized(true);
    });
    
    return () => {
      console.log("🔄 Desmontando SessionChecker");
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, isInitialized]);
  
  // Enquanto estiver carregando, mostre um indicador
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
  
  // Renderiza os filhos quando estiver pronto
  return <>{children}</>;
};

export default SessionChecker;
