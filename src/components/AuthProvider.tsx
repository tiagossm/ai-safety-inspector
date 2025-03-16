
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthUser } from "@/hooks/auth/useAuthState";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshSession: async () => false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função para buscar dados completos do usuário
  async function fetchExtendedUser(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, company_id, name, role, tier")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erro ao buscar detalhes do usuário:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Erro ao buscar dados do usuário:", err);
      return null;
    }
  }
  
  // Function to refresh the session
  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log("🔄 Refreshing authentication session...");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Failed to refresh session:", error);
        return false;
      }
      
      if (data.session) {
        console.log("✅ Session refreshed successfully");
        
        // Update user data if needed
        if (data.user && (!user || user.id !== data.user.id)) {
          const userData = await fetchExtendedUser(data.user.id);
          
          // Normalize role
          const normalizedRole = userData && userData.role
            ? (userData.role.toLowerCase() === 'administrador' ? 'admin' : 'user') as 'admin' | 'user'
            : 'user' as const;
          
          // Normalize tier
          const normalizedTier = userData && userData.tier
            ? userData.tier.toLowerCase() as "super_admin" | "company_admin" | "consultant" | "technician"
            : 'technician' as const;
          
          const enhancedUser: AuthUser = {
            ...data.user,
            role: normalizedRole,
            tier: normalizedTier,
            company_id: userData?.company_id
          };
          
          setUser(enhancedUser);
          localStorage.setItem("authUser", JSON.stringify(enhancedUser));
        }
        
        return true;
      } else {
        console.warn("No session returned after refresh");
        return false;
      }
    } catch (err) {
      console.error("Error refreshing session:", err);
      return false;
    }
  };

  // Verifica a sessão ao montar o componente
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔄 Iniciando verificação de sessão...");
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session?.user) {
          console.log("✅ Sessão restaurada do Supabase");
          // Tenta obter os dados completos do usuário
          const userData = await fetchExtendedUser(data.session.user.id);
          
          // Normalizar role de acordo com a definição do tipo
          const normalizedRole = userData && userData.role
            ? (userData.role.toLowerCase() === 'administrador' ? 'admin' : 'user') as 'admin' | 'user'
            : 'user' as const;
          
          // Normalizar tier de acordo com a definição do tipo
          const normalizedTier = userData && userData.tier
            ? userData.tier.toLowerCase() as "super_admin" | "company_admin" | "consultant" | "technician"
            : 'technician' as const;
          
          const enhancedUser: AuthUser = {
            ...data.session.user,
            role: normalizedRole,
            tier: normalizedTier,
            company_id: userData?.company_id
          };

          setUser(enhancedUser);
          localStorage.setItem("authUser", JSON.stringify(enhancedUser));
        }
      } catch (error) {
        console.error("❌ Erro ao inicializar autenticação:", error);
        toast.error("Erro ao verificar sessão. Faça login novamente.");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Configura eventos de autenticação
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔄 Estado de autenticação alterado: ${event}`);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem("authUser");
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        try {
          setLoading(true);
          const userData = await fetchExtendedUser(session.user.id);
          
          // Normalizar role de acordo com a definição do tipo
          const normalizedRole = userData && userData.role
            ? (userData.role.toLowerCase() === 'administrador' ? 'admin' : 'user') as 'admin' | 'user'
            : 'user' as const;
          
          // Normalizar tier de acordo com a definição do tipo
          const normalizedTier = userData && userData.tier
            ? userData.tier.toLowerCase() as "super_admin" | "company_admin" | "consultant" | "technician"
            : 'technician' as const;

          const enhancedUser: AuthUser = {
            ...session.user,
            role: normalizedRole,
            tier: normalizedTier,
            company_id: userData?.company_id
          };

          setUser(enhancedUser);
          localStorage.setItem("authUser", JSON.stringify(enhancedUser));
        } catch (err) {
          console.error("❌ Error fetching user data:", err);
          // Fallback para dados básicos se não conseguir buscar os dados estendidos
          const basicUser: AuthUser = {
            ...session.user,
            role: 'user' as const,
            tier: 'technician' as const
          };
          setUser(basicUser);
          localStorage.setItem("authUser", JSON.stringify(basicUser));
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Função de logout
  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("authUser");
      setUser(null);
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};
