
import { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState, AuthUser } from "@/hooks/auth/useAuthState";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import { useAuthEvents } from "@/hooks/auth/useAuthEvents";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, loading, setLoading } = useAuthState();
  const { checkSession, logout } = useAuthSession();
  const navigate = useNavigate();

  // Inicialização - verificar sessão atual
  useEffect(() => {
    let mounted = true;
    console.log("🔄 AuthProvider montado - Verificando sessão do usuário");

    const initializeAuth = async () => {
      const redirectTo = await checkSession(
        (user) => { if (mounted) setUser(user); },
        (loading) => { if (mounted) setLoading(loading); }
      );
      
      if (mounted && redirectTo) {
        navigate(redirectTo);
      }
    };

    initializeAuth();

    return () => {
      console.log("🔄 Desmontando AuthProvider");
      mounted = false;
    };
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Configurar eventos de autenticação
  useAuthEvents(setUser, setLoading);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
