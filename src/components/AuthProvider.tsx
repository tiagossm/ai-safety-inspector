import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

interface AuthUser extends User {
  role: "admin" | "user";
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
      setLoading(true);
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
    } finally {
      setLoading(false);
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
          try {
            // Fetch additional user data from the users table
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("role, tier")
              .eq("id", session.user.id)
              .maybeSingle();
            
            if (userError && userError.code !== "PGRST116") {
              console.error("Error fetching user data:", userError);
            }
            
            // Set default values if data is missing
            const userRole: "admin" | "user" = 
              (userData?.role === "admin") ? "admin" : "user";
            
            const userTier = userData?.tier as 
              "super_admin" | "company_admin" | "consultant" | "technician" || "technician";
            
            // Merge the user data with session user
            const enhancedUser: AuthUser = {
              ...session.user,
              role: userRole,
              tier: userTier
            };
            
            setUser(enhancedUser);
            
            // Redirect based on user tier if on auth page
            if (window.location.pathname === "/auth") {
              if (enhancedUser.tier === "super_admin") {
                navigate("/admin/dashboard");
              } else {
                navigate("/dashboard");
              }
            }
          } catch (error) {
            console.error("Error enhancing user with role and tier:", error);
            // Fall back to basic user with default role/tier if fetching additional data fails
            const basicUser: AuthUser = {
              ...session.user,
              role: "user",
              tier: "technician"
            };
            setUser(basicUser);
            
            if (window.location.pathname === "/auth") {
              navigate("/dashboard");
            }
          } finally {
            if (mounted) {
              setLoading(false);
            }
          }
        } else if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    checkSession();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          setLoading(true);
          // Fetch additional user data from the users table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, tier")
            .eq("id", session.user.id)
            .maybeSingle();
          
          if (userError && userError.code !== "PGRST116") {
            console.error("Error fetching user data:", userError);
          }
          
          // Set default values if data is missing
          const userRole: "admin" | "user" = 
            (userData?.role === "admin") ? "admin" : "user";
          
          const userTier = userData?.tier as 
            "super_admin" | "company_admin" | "consultant" | "technician" || "technician";
          
          // For testing, set first user as super_admin if tier is not set
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
        } catch (error) {
          console.error("Error enhancing user:", error);
          // Fall back to basic user with default role/tier
          const basicUser: AuthUser = {
            ...session.user,
            role: "user",
            tier: "technician"
          };
          setUser(basicUser);
          navigate("/dashboard");
        } finally {
          setLoading(false);
        }
        
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate("/auth");
      } else if (event === 'TOKEN_REFRESHED') {
        // Just update the user object with the current session user data
        if (session?.user) {
          // Keep the existing role/tier when refreshing token
          setUser(prev => prev ? { ...session.user, role: prev.role, tier: prev.tier } : null);
        }
      } else if (event === 'USER_UPDATED') {
        if (session?.user) {
          // Keep the existing role/tier when user is updated
          setUser(prev => prev ? { ...session.user, role: prev.role, tier: prev.tier } : null);
        }
      } else if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          try {
            // Fetch additional user data from the users table
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("role, tier")
              .eq("id", session.user.id)
              .maybeSingle();
            
            if (userError && userError.code !== "PGRST116") {
              console.error("Error fetching user data:", userError);
            }
            
            // Set default values if data is missing
            const userRole: "admin" | "user" = 
              (userData?.role === "admin") ? "admin" : "user";
            
            const userTier = userData?.tier as 
              "super_admin" | "company_admin" | "consultant" | "technician" || "technician";
            
            // Merge the user data
            const enhancedUser: AuthUser = {
              ...session.user,
              role: userRole,
              tier: userTier
            };
            
            setUser(enhancedUser);
          } catch (error) {
            console.error("Error enhancing initial user:", error);
            // Fall back to basic user info
            const basicUser: AuthUser = {
              ...session.user,
              role: "user",
              tier: "technician"
            };
            setUser(basicUser);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      } else {
        // Handle any other event
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
