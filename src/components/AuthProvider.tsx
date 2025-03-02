
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthContext, AuthUser } from "@/contexts/AuthContext";
import { handleAuthStateChange } from "@/utils/authStateHandler";
import { enhanceUserWithRoleAndTier } from "@/utils/authUtils";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuthError = async (error: any) => {
    console.error("Auth error:", error);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
    navigate("/auth");
    toast({
      title: "Erro de autenticação",
      description: "Por favor, faça login novamente.",
      variant: "destructive",
    });
  };

  const logout = async () => {
    try {
      console.log("Attempting to log out user");
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("user_token");
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

    const checkSession = async () => {
      try {
        console.log("Checking for active session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (mounted) {
            console.error("Session check error:", error);
            await handleAuthError(error);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log("Session found:", session);
          
          const enhancedUser = await enhanceUserWithRoleAndTier(session.user);
          
          setUser(enhancedUser);
          setLoading(false);
          
          if (window.location.pathname === "/auth") {
            if (enhancedUser.tier === "super_admin") {
              console.log("Redirecting super_admin to admin dashboard");
              navigate("/admin/dashboard");
            } else {
              console.log("Redirecting regular user to dashboard");
              navigate("/dashboard");
            }
          }
        } else if (mounted) {
          console.log("No active session found");
          setUser(null);
          setLoading(false);
          
          const publicPages = ["/auth", "/", "/plans", "/blog", "/contact"];
          if (!publicPages.includes(window.location.pathname)) {
            console.log("Redirecting to auth page");
            navigate("/auth");
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        if (mounted) {
          await handleAuthError(error);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          console.log("Auth state change detected:", event);
          await handleAuthStateChange(event, session, setUser, navigate, { toast });
          setLoading(false);
        }
      }
    );

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

export { useAuth } from "@/hooks/useAuth";
