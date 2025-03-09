
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthUser } from "@/hooks/auth/useAuthState";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {}
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
  async function fetchExtendedUser(userId: string): Promise<AuthUser | null> {
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
          // Normaliza os valores de role e tier
          const normalizedRole = userData && userData.role
            ? userData.role.toLowerCase() === 'administrador'
              ? 'admin'
              : userData.role.toLowerCase()
            : 'user';
          const normalizedTier = userData && userData.tier
            ? userData.tier.toLowerCase()
            : 'technician';
          
          const enhancedUser: AuthUser = {
            ...data.session.user,
            role: normalizedRole,
            tier: normalizedTier,
            company_id: userData?.company_id // Pode ser null para super_admin
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
          const normalizedRole = userData && userData.role
            ? userData.role.toLowerCase() === 'administrador'
              ? 'admin'
              : userData.role.toLowerCase()
            : 'user';
          const normalizedTier = userData && userData.tier
            ? userData.tier.toLowerCase()
            : 'technician';

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
            role: 'user',
            tier: 'technician'
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
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
