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

  // Função para buscar os dados completos do usuário (por exemplo, company_id)
  async function fetchExtendedUser(userId: string): Promise<AuthUser | null> {
    const { data, error } = await supabase
      .from("users")
      .select("id, company_id, name") // adicione outros campos conforme necessário
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erro ao buscar detalhes do usuário:", error);
      return null;
    }
    return data;
  }

  // Inicializa a sessão e busca dados completos do usuário
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔄 Iniciando verificação de sessão...");

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session?.user) {
          console.log("✅ Sessão restaurada do Supabase");
          // Busca os dados completos do usuário
          const extendedUser = await fetchExtendedUser(data.session.user.id);
          if (extendedUser) {
            setUser(extendedUser);
            localStorage.setItem("authUser", JSON.stringify(extendedUser));
          } else {
            // Caso não consiga buscar os dados completos, mantenha o usuário básico
            setUser(data.session.user);
            localStorage.setItem("authUser", JSON.stringify(data.session.user));
          }
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

  // Atualiza o estado do usuário em eventos de autenticação
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 Estado de autenticação alterado: ${event}`);
        if (session?.user) {
          // Busca os dados completos do usuário após a mudança de estado
          const extendedUser = await fetchExtendedUser(session.user.id);
          if (extendedUser) {
            setUser(extendedUser);
            localStorage.setItem("authUser", JSON.stringify(extendedUser));
          } else {
            setUser(session.user);
            localStorage.setItem("authUser", JSON.stringify(session.user));
          }
        } else {
          setUser(null);
          localStorage.removeItem("authUser");
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("authUser");
    setUser(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
