import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthUser } from "@/hooks/auth/useAuthState";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
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
  }

  // Verifica a sessão ao montar o componente
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔄 Iniciando verificação de sessão...");
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session?.user) {
          console.log("✅ Sessão restaurada do Supabase");
          // Tenta obter os dados completos do usuário
          const userData = await fetchExtendedUser(data.session.user.id);
          
          let normalizedRole = 'user';
          let normalizedTier = 'technician';

          if (userData) {
            normalizedRole = userData.role
              ? userData.role.toLowerCase() === 'administrador'
                ? 'admin'
                : userData.role.toLowerCase()
              : 'user';
            normalizedTier = userData.tier ? userData.tier.toLowerCase() : 'technician';
          }
          
          // Se o usuário for o super admin (ex.: email específico), force tier = "super_admin"
          if (data.session.user.email === "eng.tiagosm@gmail.com") {
            normalizedTier = "super_admin";
          }
          
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
      if (session?.user) {
        try {
          const userData = await fetchExtendedUser(session.user.id);
          
          let normalizedRole = 'user';
          let normalizedTier = 'technician';

          if (userData) {
            normalizedRole = userData.role
              ? userData.role.toLowerCase() === 'administrador'
                ? 'admin'
                : userData.role.toLowerCase()
              : 'user';
            normalizedTier = userData.tier ? userData.tier.toLowerCase() : 'technician';
          }
          
          // Força tier "super_admin" para o super admin
          if (session.user.email === "eng.tiagosm@gmail.com") {
            normalizedTier = "super_admin";
          }
          
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
          setUser(session.user as AuthUser);
          localStorage.setItem("authUser", JSON.stringify(session.user));
        }
      } else {
        setUser(null);
        localStorage.removeItem("authUser");
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Função de logout
  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("authUser");
    setUser(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {loading ? <div>Carregando...</div> : children}
    </AuthContext.Provider>
  );
};
