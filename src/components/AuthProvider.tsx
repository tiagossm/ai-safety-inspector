
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useToast } from "./ui/use-toast";

interface AuthUser extends User {
  role?: "admin" | "user";
  tier?: "super_admin" | "company_admin" | "consultant" | "technician";
}

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
  const { toast } = useToast();

  const handleAuthError = async (error: any) => {
    console.error("Auth error:", error);
    // Clear the session on auth errors
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
    navigate("/auth");
    
    // Show appropriate error message
    toast({
      title: "Erro de autenticação",
      description: "Por favor, faça login novamente.",
      variant: "destructive",
    });
  };

  const logout = async () => {
    try {
      console.log("🔄 Iniciando logout...");
      await supabase.auth.signOut();
      setUser(null);
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

  useEffect(() => {
    let mounted = true;
    console.log("🔄 AuthProvider montado - Verificando sessão do usuário");

    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        console.log("🔍 Tentando obter sessão atual...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Erro ao obter sessão:", error);
          if (mounted) {
            await handleAuthError(error);
          }
          return;
        }

        console.log("ℹ️ Sessão obtida:", session ? "Sessão ativa" : "Sem sessão ativa");

        if (session?.user && mounted) {
          console.log("✅ Usuário autenticado:", session.user.email);
          
          // Fetch additional user data from the users table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, tier")
            .eq("id", session.user.id)
            .maybeSingle();
          
          if (userError && userError.code !== "PGRST116") {
            console.error("Error fetching user data:", userError);
          }
          
          // Set a default tier if not present
          let userTier: "super_admin" | "company_admin" | "consultant" | "technician" = "technician";
          
          // If we have user data, use it
          if (userData) {
            userTier = userData.tier as "super_admin" | "company_admin" | "consultant" | "technician" || "technician";
          }
          
          // Ensure role is always either "admin" or "user"
          const userRole: "admin" | "user" = (userData?.role === "admin") ? "admin" : "user";
          
          // Merge the user data with session user
          const enhancedUser: AuthUser = {
            ...session.user,
            role: userRole,
            tier: userTier
          };
          
          console.log("✅ Dados do usuário definidos:", {
            email: enhancedUser.email,
            role: userRole,
            tier: userTier
          });
          
          setUser(enhancedUser);
          setLoading(false);
          
          // Redirect based on user tier
          if (window.location.pathname === "/auth") {
            console.log("🔄 Redirecionando usuário autenticado da página de login");
            if (enhancedUser.tier === "super_admin") {
              navigate("/admin/dashboard");
            } else {
              navigate("/dashboard");
            }
          }
        } else if (mounted) {
          console.log("ℹ️ Nenhum usuário autenticado");
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Erro inesperado ao verificar sessão:", error);
        if (mounted) {
          await handleAuthError(error);
        }
      }
    };

    checkSession();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Estado de autenticação alterado:", event);
      
      if (mounted) {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log("✅ Evento SIGNED_IN recebido com usuário:", session.user.email);
          
          // Fetch additional user data from the users table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, tier")
            .eq("id", session.user.id)
            .maybeSingle();
          
          if (userError && userError.code !== "PGRST116") {
            console.error("Error fetching user data:", userError);
          }
          
          // Set a default tier if not present
          let userTier: "super_admin" | "company_admin" | "consultant" | "technician" = "technician";
          
          // If we have user data, use it
          if (userData) {
            userTier = userData.tier as "super_admin" | "company_admin" | "consultant" | "technician" || "technician";
          }
          
          // For testing, set first user as super_admin
          if (!userData?.tier) {
            try {
              await supabase
                .from("users")
                .update({ tier: "super_admin" })
                .eq("id", session.user.id);
              
              userTier = "super_admin";
            } catch (error) {
              console.error("Could not set super_admin tier:", error);
            }
          }
          
          // Ensure role is always either "admin" or "user"
          const userRole: "admin" | "user" = (userData?.role === "admin") ? "admin" : "user";
          
          // Merge the user data
          const enhancedUser: AuthUser = {
            ...session.user,
            role: userRole,
            tier: userTier
          };
          
          setUser(enhancedUser);
          
          // Redirect based on user tier
          if (enhancedUser.tier === "super_admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/dashboard");
          }
          
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo de volta!",
          });
        } else if (event === 'SIGNED_OUT') {
          console.log("ℹ️ Evento SIGNED_OUT recebido");
          setUser(null);
          navigate("/auth");
          toast({
            title: "Logout realizado",
            description: "Até logo!",
          });
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("ℹ️ Evento TOKEN_REFRESHED recebido");
          if (session?.user) {
            // Ensure role is either "admin" or "user"
            const enhancedUser: AuthUser = {
              ...session.user,
              role: "user" // Default to user role on token refresh
            };
            setUser(enhancedUser);
          } else {
            setUser(null);
          }
        } else if (event === 'USER_UPDATED') {
          console.log("ℹ️ Evento USER_UPDATED recebido");
          if (session?.user) {
            // Ensure role is either "admin" or "user"
            const enhancedUser: AuthUser = {
              ...session.user,
              role: "user" // Default to user role on user update
            };
            setUser(enhancedUser);
          } else {
            setUser(null);
          }
        } else if (event === 'INITIAL_SESSION') {
          console.log("ℹ️ Evento INITIAL_SESSION recebido");
          // Handle initial session load
          if (session?.user) {
            // Fetch additional user data from the users table
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("role, tier")
              .eq("id", session.user.id)
              .maybeSingle();
            
            if (userError && userError.code !== "PGRST116") {
              console.error("Error fetching user data:", userError);
            }
            
            // Set a default tier if not present
            let userTier: "super_admin" | "company_admin" | "consultant" | "technician" = "technician";
            
            // If we have user data, use it
            if (userData) {
              userTier = userData.tier as "super_admin" | "company_admin" | "consultant" | "technician" || "technician";
            }
            
            // Ensure role is always either "admin" or "user"
            const userRole: "admin" | "user" = (userData?.role === "admin") ? "admin" : "user";
            
            // Merge the user data
            const enhancedUser: AuthUser = {
              ...session.user,
              role: userRole,
              tier: userTier
            };
            
            setUser(enhancedUser);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
        
        setLoading(false);
      }
    });

    return () => {
      console.log("🔄 Desmontando AuthProvider");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
