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

  // **Verifica a sessão ao montar o componente**
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔄 Iniciando verificação de sessão...");

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session?.user) {
          console.log("✅ Sessão restaurada do Supabase");
          setUser(data.session.user);
          localStorage.setItem("authUser", JSON.stringify(data.session.user));
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

  // **Configura eventos de autenticação**
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🔄 Estado de autenticação alterado: ${event}`);
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem("authUser", JSON.stringify(session.user));
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

  // **Função de logout**
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