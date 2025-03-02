
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { AuthContext, AuthUser } from "@/contexts/AuthContext";
import { handleAuthStateChange } from "@/utils/authStateHandler";
import { enhanceUserWithRoleAndTier } from "@/utils/authUtils";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast(); // Destructure toast from useToast

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
      console.log("Attempting to log out user");
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("user_token"); // Clear stored token
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
          
          // Enhance user with role and tier
          const enhancedUser = await enhanceUserWithRoleAndTier(session.user);
          
          setUser(enhancedUser);
          setLoading(false);
          
          // Redirect based on user tier
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
          
          // If not authenticated and not on public pages, redirect to auth
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

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          await handleAuthStateChange(event, session, setUser, navigate, toast);
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

// Export the hook from here to maintain backward compatibility
export { useAuth } from "@/hooks/useAuth";
