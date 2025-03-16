
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "./useAuthState";

export function useAuthSession() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuthError = async (error: any) => {
    console.error("Auth error:", error);
    await supabase.auth.signOut();
    navigate("/auth");
    
    toast({
      title: "Erro de autenticação",
      description: "Por favor, faça login novamente.",
      variant: "destructive",
    });
    
    return null;
  };

  const logout = async () => {
    try {
      console.log("🔄 Iniciando logout...");
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      console.log("✅ Logout realizado com sucesso");
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para buscar dados adicionais do usuário após autenticação
  const fetchUserData = async (userId: string): Promise<Partial<AuthUser>> => {
    try {
      console.log("Fetching user data for userId:", userId);
      
      // Corrigindo a query para apenas selecionar colunas que existem na tabela users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, tier")
        .eq("id", userId)
        .maybeSingle();
      
      if (userError) {
        console.error("Error fetching user data:", userError);
        return {};
      }
      
      console.log("Retrieved user data:", userData);
      
      // Se temos dados do usuário, usamos eles
      if (userData) {
        // Map role to the expected type
        let role: AuthUser["role"] = 'user';
        if (userData.role?.toLowerCase() === 'administrador') {
          role = 'super_admin';
        }
        
        // Ensure tier is one of the allowed values
        let tier: AuthUser["tier"] = 'technician';
        if (userData.tier === 'super_admin' || 
            userData.tier === 'company_admin' || 
            userData.tier === 'consultant' || 
            userData.tier === 'technician') {
          tier = userData.tier;
        }
        
        return { role, tier };
      }
      
      return {};
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      return {};
    }
  };

  // Função para verificar sessão atual
  const checkSession = async (
    setUser: (user: AuthUser | null) => void, 
    setLoading: (loading: boolean) => void
  ) => {
    try {
      console.log("🔍 Tentando obter sessão atual...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("❌ Erro ao obter sessão:", error);
        return await handleAuthError(error);
      }

      console.log("ℹ️ Sessão obtida:", session ? "Sessão ativa" : "Sem sessão ativa");

      if (session?.user) {
        console.log("✅ Usuário autenticado:", session.user.email);
        
        // Buscar dados adicionais
        const userData = await fetchUserData(session.user.id);
        
        // Combinar os dados com type assertion para garantir tipo correto
        const enhancedUser = {
          ...session.user,
          ...userData
        } as AuthUser;
        
        console.log("✅ Dados do usuário definidos:", {
          email: enhancedUser.email,
          role: enhancedUser.role,
          tier: enhancedUser.tier
        });
        
        setUser(enhancedUser);
        setLoading(false);
        
        // Redirecionar se estiver na página de login
        if (window.location.pathname === "/auth") {
          console.log("🔄 Redirecionando usuário autenticado da página de login");
          if (enhancedUser.tier === "super_admin") {
            return "/admin/dashboard";
          } else {
            return "/dashboard";
          }
        }
      } else {
        console.log("ℹ️ Nenhum usuário autenticado");
        setUser(null);
        setLoading(false);
      }
      
      return null; // Nenhum redirecionamento necessário
    } catch (error) {
      console.error("❌ Erro inesperado ao verificar sessão:", error);
      return await handleAuthError(error);
    }
  };

  return {
    checkSession,
    handleAuthError,
    fetchUserData,
    logout
  };
}
