
import { NavigateFunction } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { enhanceUserWithRoleAndTier, handleInitialSetup } from "./authUtils";
import { AuthUser } from "@/contexts/AuthContext";
import { toast as ToastFunction } from "@/hooks/use-toast";

// Define a toast interface that matches what we're passing
interface ToastInterface {
  toast: typeof ToastFunction;
}

export type AuthStateChangeHandler = (
  event: string, 
  session: Session | null,
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
  navigate: NavigateFunction,
  toastInterface: ToastInterface
) => Promise<void>;

export const handleAuthStateChange: AuthStateChangeHandler = async (
  event, 
  session,
  setUser,
  navigate,
  { toast }
) => {
  console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
  
  try {
    if (event === 'SIGNED_IN' && session?.user) {
      console.log("User signed in:", session.user.email);
      
      try {
        console.log("Enhancing user with role and tier");
        const enhancedUser = await enhanceUserWithRoleAndTier(session.user);
        console.log("Enhanced user:", enhancedUser);
        
        // Update user state first to ensure UI updates
        setUser(enhancedUser);
        
        // For new users without a tier, set them up
        if (!enhancedUser.tier) {
          console.log("User has no tier, setting up initial configuration");
          await handleInitialSetup(session.user);
          enhancedUser.tier = "super_admin";
        }
        
        // Get current path
        const currentPath = window.location.pathname;
        console.log("Current path:", currentPath);
        
        // Only redirect if on auth page
        if (currentPath === "/auth") {
          console.log("On auth page, redirecting based on user tier");
          // Redirect based on user tier
          if (enhancedUser.tier === "super_admin") {
            console.log("Redirecting super_admin to admin dashboard");
            navigate("/admin/dashboard");
          } else {
            // Check if user has a company
            const { data: companyUser, error } = await supabase
              .from("user_companies")
              .select("company_id")
              .eq("user_id", session.user.id)
              .maybeSingle();
            
            if (error) {
              console.error("Error checking user company:", error);
            }
            
            if (companyUser) {
              console.log("User has company, redirecting to dashboard");
              navigate("/dashboard");
            } else {
              console.log("User has no company, redirecting to company registration");
              navigate("/cadastro-empresa");
            }
          }
          
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo de volta!",
          });
        }
      } catch (error) {
        console.error("Error processing sign-in:", error);
        // Still set user with basic info to avoid getting stuck
        setUser(session.user as AuthUser);
        
        toast({
          title: "Erro no processamento do login",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        });
        
        // Redirect to dashboard as fallback
        if (window.location.pathname === "/auth") {
          navigate("/dashboard");
        }
      }
    } else if (event === 'SIGNED_OUT') {
      console.log("User signed out");
      setUser(null);
      navigate("/auth");
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } else if (event === 'TOKEN_REFRESHED') {
      console.log("Token refreshed");
      if (session?.user) {
        try {
          const enhancedUser = await enhanceUserWithRoleAndTier(session.user);
          setUser(enhancedUser);
        } catch (error) {
          console.error("Error enhancing user on token refresh:", error);
          setUser(session.user as AuthUser);
        }
      } else {
        setUser(null);
      }
    } else if (event === 'USER_UPDATED') {
      console.log("User updated");
      if (session?.user) {
        try {
          const enhancedUser = await enhanceUserWithRoleAndTier(session.user);
          setUser(enhancedUser);
        } catch (error) {
          console.error("Error enhancing user on user update:", error);
          setUser(session.user as AuthUser);
        }
      } else {
        setUser(null);
      }
    } else if (event === 'INITIAL_SESSION') {
      console.log("Initial session check");
      // Handle initial session load
      if (session?.user) {
        try {
          const enhancedUser = await enhanceUserWithRoleAndTier(session.user);
          setUser(enhancedUser);
        } catch (error) {
          console.error("Error enhancing user on initial session:", error);
          setUser(session.user as AuthUser);
        }
      } else {
        setUser(null);
      }
    }
  } catch (error) {
    console.error("Error in handleAuthStateChange:", error);
    // Reset user state and don't block the auth flow
    if (event === 'SIGNED_IN' && session?.user) {
      setUser(session.user as AuthUser);
    } else {
      setUser(null);
    }
    
    toast({
      title: "Erro no processamento de autenticação",
      description: "Ocorreu um erro inesperado. Tente novamente.",
      variant: "destructive",
    });
    
    // Redirect to dashboard as fallback if signed in
    if (event === 'SIGNED_IN' && window.location.pathname === "/auth") {
      navigate("/dashboard");
    }
  }
};
