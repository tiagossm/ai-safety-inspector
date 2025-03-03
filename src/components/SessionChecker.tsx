
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

const SessionChecker = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Use um único estado para controlar a sessão
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log("✅ SessionChecker montado (URL atual:", location.pathname, ")");
    
    // Função para verificar a sessão atual
    const checkSession = async () => {
      try {
        console.log("🔍 Tentando obter sessão do usuário...");
        
        // Obtém a sessão atual
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Erro ao verificar sessão:", error);
          toast({
            title: "Erro de autenticação",
            description: "Não foi possível verificar sua sessão",
            variant: "destructive",
          });
          
          setIsLoading(false);
          if (location.pathname !== "/auth") {
            navigate("/auth");
          }
          setInitialized(true);
          return;
        }
        
        const session = data.session;
        console.log("ℹ️ Status da sessão:", session ? "Autenticado" : "Não autenticado");
        
        // Se não houver sessão, redirecione para /auth
        if (!session) {
          console.log("ℹ️ Usuário não autenticado");
          setIsLoading(false);
          
          if (location.pathname !== "/auth") {
            console.log("🔄 Redirecionando para tela de login");
            navigate("/auth");
          }
          
          setInitialized(true);
          return;
        }
        
        // Se o usuário estiver autenticado
        console.log("✅ Usuário autenticado:", session.user.email);
        
        try {
          // Busca os dados do usuário
          console.log("🔍 Buscando dados do usuário...");
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, tier")
            .eq("id", session.user.id)
            .maybeSingle();
          
          if (userError) {
            console.error("❌ Erro ao buscar dados do usuário:", userError);
            // Definir um tier padrão mesmo se houver erro
            const defaultTier = "technician";
            console.log("⚠️ Usando tier padrão:", defaultTier);
            
            // Redirecionar apropriadamente com base na rota atual
            handleRedirect(defaultTier);
            setIsLoading(false);
            setInitialized(true);
            return;
          }
          
          // Define o tier do usuário
          const userTier = userData?.tier || "technician";
          console.log("✅ Tier do usuário:", userTier);
          
          // Redireciona com base no tier
          handleRedirect(userTier);
          
        } catch (userDataError) {
          console.error("❌ Erro ao processar dados do usuário:", userDataError);
          // Definir um tier padrão mesmo se houver erro
          handleRedirect("technician");
        }
        
        setIsLoading(false);
        setInitialized(true);
        
      } catch (sessionError) {
        console.error("❌ Erro inesperado ao verificar sessão:", sessionError);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao verificar seu login",
          variant: "destructive",
        });
        
        setIsLoading(false);
        if (location.pathname !== "/auth") {
          navigate("/auth");
        }
        setInitialized(true);
      }
    };
    
    // Função para lidar com redirecionamentos
    const handleRedirect = (userTier: string) => {
      // Apenas redirecione se estiver na rota inicial ou na rota de autenticação
      if (location.pathname === "/" || location.pathname === "/auth") {
        console.log("🔄 Redirecionando com base no tier:", userTier);
        
        if (userTier === "super_admin") {
          console.log("🚀 Redirecionando para dashboard de administrador");
          navigate("/admin/dashboard");
        } else {
          console.log("🚀 Redirecionando para dashboard padrão");
          navigate("/dashboard");
        }
      } else {
        console.log("✅ Usuário já está em uma rota protegida:", location.pathname);
      }
    };
    
    // Apenas execute a verificação de sessão se o componente não estiver inicializado
    if (!initialized) {
      checkSession();
    }
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Estado de autenticação alterado:", event);
      
      if (event === "SIGNED_IN") {
        console.log("✅ Usuário acabou de autenticar-se");
        checkSession();
      } else if (event === "SIGNED_OUT") {
        console.log("ℹ️ Usuário desconectado");
        navigate("/auth");
        setIsLoading(false);
        setInitialized(true);
      }
    });
    
    return () => {
      console.log("🔄 Desmontando SessionChecker");
      subscription.unsubscribe();
    };
  }, [navigate, toast, location.pathname, initialized]);
  
  // Enquanto estiver carregando, mostre um indicador
  if (isLoading && !initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Renderiza os filhos quando estiver pronto
  return <>{children}</>;
};

export default SessionChecker;
