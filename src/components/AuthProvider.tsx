import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthEvents } from "@/hooks/auth/useAuthEvents";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log("🔄 Iniciando verificação de sessão...");

      // **Evita re-renderização desnecessária**
      if (user) {
        console.log("✅ Usuário já autenticado, ignorando nova verificação.");
        setLoading(false);
        return;
      }

      try {
        // **Verifica se há sessão armazenada**
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
          console.log("✅ Sessão restaurada do localStorage");
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }

        // **Se não houver sessão no localStorage, verifica com o Supabase**
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
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log("🔄 Desmontando AuthProvider");
      mounted = false;
    };
  }, []); // **✅ Executa apenas uma vez**

  // **🔹 Adiciona eventos de autenticação**
  useAuthEvents(setUser, setLoading);

  return (
    <AuthContext.Provider value={{ user, loading, logout: async () => {
      await supabase.auth.signOut();
      localStorage.removeItem("authUser");
      setUser(null);
      navigate("/auth");
    } }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
