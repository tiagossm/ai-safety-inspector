
import { NavigateFunction } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { enhanceUserWithRoleAndTier, handleInitialSetup } from "./authUtils";
import { AuthUser } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export type AuthStateChangeHandler = (
  event: string, 
  session: Session | null,
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
  navigate: NavigateFunction,
  toast: ReturnType<typeof useToast>
) => Promise<void>;

export const handleAuthStateChange: AuthStateChangeHandler = async (
  event, 
  session,
  setUser,
  navigate,
  toast
) => {
  console.log("Auth state changed:", event);
  
  if (event === 'SIGNED_IN' && session?.user) {
    console.log("User signed in:", session.user);
    
    const enhancedUser = await enhanceUserWithRoleAndTier(session.user);
    
    // For new users without a tier, set them up
    if (!enhancedUser.tier) {
      await handleInitialSetup(session.user);
      enhancedUser.tier = "super_admin";
    }
    
    setUser(enhancedUser);
    
    // Redirect based on user tier
    if (enhancedUser.tier === "super_admin") {
      console.log("Redirecting super_admin to admin dashboard");
      navigate("/admin/dashboard");
    } else {
      console.log("Redirecting regular user to dashboard");
      navigate("/dashboard");
    }
    
    toast.toast({
      title: "Login realizado com sucesso",
      description: "Bem-vindo de volta!",
    });
  } else if (event === 'SIGNED_OUT') {
    console.log("User signed out");
    setUser(null);
    navigate("/auth");
    toast.toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  } else if (event === 'TOKEN_REFRESHED') {
    console.log("Token refreshed");
    if (session?.user) {
      const enhancedUser = await enhanceUserWithRoleAndTier(session.user);
      setUser(enhancedUser);
    } else {
      setUser(null);
    }
  } else if (event === 'USER_UPDATED') {
    console.log("User updated");
    if (session?.user) {
      const enhancedUser = await enhanceUserWithRoleAndTier(session.user);
      setUser(enhancedUser);
    } else {
      setUser(null);
    }
  } else if (event === 'INITIAL_SESSION') {
    console.log("Initial session check");
    // Handle initial session load
    if (session?.user) {
      const enhancedUser = await enhanceUserWithRoleAndTier(session.user);
      setUser(enhancedUser);
    } else {
      setUser(null);
    }
  }
};
