
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
          // Fetch additional user data
          try {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("role, tier, company_id")
              .eq("id", data.session.user.id)
              .single();

            if (userError) {
              console.error("Erro ao buscar dados do usuário:", userError);
              // Default values if we can't access user data
              const enhancedUser: AuthUser = {
                ...data.session.user,
                role: "user",
                tier: "technician",
                company_id: undefined
              };
              
              setUser(enhancedUser);
              localStorage.setItem("authUser", JSON.stringify(enhancedUser));
              setLoading(false);
              return;
            }

            // Create enhanced user with proper typing
            const enhancedUser: AuthUser = {
              ...data.session.user,
              role: userData?.role === "admin" ? "admin" : "user",
              tier: userData?.tier || "technician",
              company_id: userData?.company_id
            };
            
            setUser(enhancedUser);
            localStorage.setItem("authUser", JSON.stringify(enhancedUser));
          } catch (err) {
            console.error("Error fetching user data:", err);
            // Default values if exception occurs
            const enhancedUser: AuthUser = {
              ...data.session.user,
              role: "user",
              tier: "technician"
            };
            
            setUser(enhancedUser);
            localStorage.setItem("authUser", JSON.stringify(enhancedUser));
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

  // **Configura eventos de autenticação**
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔄 Estado de autenticação alterado: ${event}`);
      if (session?.user) {
        try {
          // Fetch additional user data
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, tier, company_id")
            .eq("id", session.user.id)
            .single();

          if (userError) {
            console.error("Erro ao buscar dados do usuário:", userError);
            // Default values if we can't access user data
            const enhancedUser: AuthUser = {
              ...session.user,
              role: "user",
              tier: "technician"
            };
            
            setUser(enhancedUser);
            localStorage.setItem("authUser", JSON.stringify(enhancedUser));
            return;
          }

          // Create enhanced user with proper typing
          const enhancedUser: AuthUser = {
            ...session.user,
            role: userData?.role === "admin" ? "admin" : "user",
            tier: userData?.tier || "technician",
            company_id: userData?.company_id
          };
          
          setUser(enhancedUser);
          localStorage.setItem("authUser", JSON.stringify(enhancedUser));
        } catch (err) {
          console.error("Error in auth state change:", err);
          // Default values if exception occurs
          const enhancedUser: AuthUser = {
            ...session.user,
            role: "user",
            tier: "technician"
          };
          
          setUser(enhancedUser);
          localStorage.setItem("authUser", JSON.stringify(enhancedUser));
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
