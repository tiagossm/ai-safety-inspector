
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuthError } from "./useAuthError";
import type { AuthUser } from "@/types/auth";
import { User } from "@supabase/supabase-js";

export function useSessionManager() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleAuthError } = useAuthError();

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

  const fetchUserData = async (userId: string) => {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, tier")
      .eq("id", userId)
      .maybeSingle();
    
    if (userError && userError.code !== "PGRST116") {
      console.error("Error fetching user data:", userError);
    }
    
    return userData;
  };

  const enhanceUserWithRoleTier = async (sessionUser: User) => {
    try {
      const userData = await fetchUserData(sessionUser.id);
      
      // Set default values if data is missing
      const userRole: "admin" | "user" = 
        (userData?.role === "admin") ? "admin" : "user";
      
      const userTier = userData?.tier as 
        "super_admin" | "company_admin" | "consultant" | "technician" || "technician";
      
      // Merge the user data with session user
      const enhancedUser: AuthUser = {
        ...sessionUser,
        role: userRole,
        tier: userTier
      };
      
      return enhancedUser;
    } catch (error) {
      console.error("Error enhancing user with role and tier:", error);
      // Fall back to basic user with default role/tier
      const basicUser: AuthUser = {
        ...sessionUser,
        role: "user",
        tier: "technician"
      };
      return basicUser;
    }
  };

  return {
    user,
    setUser,
    loading,
    setLoading,
    logout,
    enhanceUserWithRoleTier,
    fetchUserData,
    handleAuthError
  };
}
