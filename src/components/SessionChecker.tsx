import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

const SessionChecker = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    console.log("✅ SessionChecker iniciado...");

    const checkSession = async () => {
      try {
        console.log("🔍 Verificando sessão do usuário...");
        setIsLoading(true);
        
        // Obtém a sessão atual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Erro ao verificar sessão:", error);
          toast({
            title: "Erro de autenticação",
            description: "Não foi possível verificar sua sessão",
            variant: "destructive",
          });
          navigate("/auth");
          setIsLoading(false);
          setSessionChecked(true);
          return;
        }

        console.log("✅ Sessão verificada:", session ? "Válida" : "Inválida");
        
        if (!session) {
          console.warn("⚠️ Usuário não autenticado, redirecionando para login...");
          if (location.pathname !== "/auth") {
            navigate("/auth");
          }
          setIsLoading(false);
          setSessionChecked(true);
          return;
        }

        // Obtém os dados do usuário autenticado
        if (session?.user) {
          console.log("🔍 Obtendo dados do usuário...");

          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, tier")
            .eq("id", session.user.id)
            .maybeSingle();
          
          if (userError) {
            console.error("❌ Erro ao obter dados do usuário:", userError);
            setIsLoading(false);
            setSessionChecked(true);
            return;
          }
          
          const userTier = userData?.tier || "technician"; // Define "technician" como padrão
          console.log("✅ Perfil do usuário:", userTier);
          
          // Verifica se a rota é a inicial para evitar redirecionamento em páginas protegidas
          if (location.pathname === "/" || location.pathname === "/auth") {
            console.log("🔄 Redirecionando com base no perfil do usuário...");
            if (userTier === "super_admin") {
              console.log("🚀 Redirecionando para dashboard de administrador...");
              navigate("/admin/dashboard");
            } else {
              console.log("✅ Redirecionando para dashboard padrão...");
              navigate("/dashboard");
            }
          } else {
            console.log("✅ Usuário já está em uma rota protegida:", location.pathname);
          }
        }

        setIsLoading(false);
        setSessionChecked(true);
      } catch (err) {
        console.error("❌ Erro inesperado ao verificar sessão:", err);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao verificar seu login",
          variant: "destructive",
        });
        navigate("/auth");
        setIsLoading(false);
        setSessionChecked(true);
      }
    };

    // Verifica a sessão apenas se ainda não foi verificada
    if (!sessionChecked) {
      checkSession();
    }
    
    // Monitoramento do estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Estado de autenticação alterado:", event);
      
      if (event === "SIGNED_IN") {
        console.log("✅ Usuário autenticado com sucesso, verificando perfil...");
        setIsLoading(true);
        setSessionChecked(false);
      } else if (event === "SIGNED_OUT") {
        console.warn("⚠️ Usuário desconectado, redirecionando para login...");
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, sessionChecked, location.pathname]);

  // Renderiza o estado de carregamento ou o conteúdo da aplicação
  if (isLoading && !sessionChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
s
export default SessionChecker;
