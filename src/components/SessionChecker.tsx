
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

const SessionChecker = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Verificando sessão do usuário...");
        setIsLoading(true);
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          toast({
            title: "Erro de autenticação",
            description: "Não foi possível verificar sua sessão",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        console.log("Sessão verificada:", session ? "Válida" : "Inválida");
        
        if (!session) {
          console.log("Usuário não autenticado, redirecionando para login");
          // Only redirect if not already on auth page
          if (window.location.pathname !== "/auth") {
            navigate("/auth");
          }
          return;
        }

        // Get user data
        if (session?.user) {
          console.log("Obtendo dados do usuário...");
          
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, tier")
            .eq("id", session.user.id)
            .maybeSingle();
          
          if (userError) {
            console.error("Erro ao obter dados do usuário:", userError);
          }
          
          // Determine user tier and set default if not present
          const userTier = userData?.tier || "technician";
          console.log("Perfil do usuário:", userTier);
          
          // Handle redirection based on tier
          if (userTier === "super_admin") {
            console.log("Redirecionando para dashboard de administrador");
            navigate("/admin/dashboard");
          } else {
            console.log("Redirecionando para dashboard padrão");
            navigate("/dashboard");
          }
        }
      } catch (err) {
        console.error("Erro inesperado ao verificar sessão:", err);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao verificar seu login",
          variant: "destructive",
        });
        navigate("/auth");
      } finally {
        setIsLoading(false);
        setSessionChecked(true);
        console.log("Verificação de sessão concluída");
      }
    };

    // Check session only if not already on auth page and session hasn't been checked
    if (!sessionChecked && window.location.pathname !== "/auth") {
      checkSession();
    } else if (window.location.pathname === "/auth") {
      setIsLoading(false);
      setSessionChecked(true);
    }
    
    // Set up authentication state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Estado de autenticação alterado:", event);
      
      if (event === 'SIGNED_IN') {
        console.log("Usuário autenticado com sucesso, verificando perfil");
        checkSession();
      } else if (event === 'SIGNED_OUT') {
        console.log("Usuário desconectado");
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, sessionChecked]);

  // Render loading state or children
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

export default SessionChecker;
