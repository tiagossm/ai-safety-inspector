
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
      await supabase.auth.signOut();
      setUser(null);
      navigate("/auth");
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
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

    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (mounted) {
            await handleAuthError(error);
          }
          return;
        }

        if (session?.user && mounted) {
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
          
          // Merge the user data with session user
          const enhancedUser: AuthUser = {
            ...session.user,
            role: userData?.role as "admin" | "user" || "user",
            tier: userTier
          };
          
          setUser(enhancedUser);
          setLoading(false);
          
          // Redirect based on user tier
          if (window.location.pathname === "/auth") {
            if (enhancedUser.tier === "super_admin") {
              navigate("/admin/dashboard");
            } else {
              navigate("/dashboard");
            }
          }
        } else if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          await handleAuthError(error);
        }
      }
    };

    checkSession();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (mounted) {
        if (event === 'SIGNED_IN' && session?.user) {
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
          
          // Merge the user data
          const enhancedUser: AuthUser = {
            ...session.user,
            role: userData?.role as "admin" | "user" || "user",
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
          setUser(null);
          navigate("/auth");
          toast({
            title: "Logout realizado",
            description: "Até logo!",
          });
        } else if (event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const enhancedUser: AuthUser = {...session.user};
            setUser(enhancedUser);
          } else {
            setUser(null);
          }
        } else if (event === 'USER_UPDATED') {
          if (session?.user) {
            const enhancedUser: AuthUser = {...session.user};
            setUser(enhancedUser);
          } else {
            setUser(null);
          }
        } else if (event === 'INITIAL_SESSION') {
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
            
            // Merge the user data
            const enhancedUser: AuthUser = {
              ...session.user,
              role: userData?.role as "admin" | "user" || "user",
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
