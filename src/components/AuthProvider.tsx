
import { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState, AuthUser } from "@/hooks/auth/useAuthState";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import { useAuthEvents } from "@/hooks/auth/useAuthEvents";
import { toast } from "sonner";

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
      try {
        const redirectTo = await checkSession(
          (user) => { if (mounted) setUser(user); },
          (loading) => { if (mounted) setLoading(loading); }
        );
        
        if (mounted && redirectTo) {
          console.log("🔄 Redirecionando para:", redirectTo);
          navigate(redirectTo);
        }
      } catch (error) {
        console.error("❌ Erro ao inicializar autenticação:", error);
        if (mounted) {
          setLoading(false);
          toast.error("Erro ao verificar sua sessão. Por favor, faça login novamente.");
        }
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
