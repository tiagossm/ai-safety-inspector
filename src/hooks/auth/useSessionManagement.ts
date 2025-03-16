
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthUser } from "@/hooks/auth/useAuthState";
import { fetchExtendedUser } from "@/hooks/auth/useFetchExtendedUser";

export function useSessionManagement() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Normalize user data to match AuthUser type
  const normalizeUserData = useCallback(async (sessionUser: any, userData: any): Promise<AuthUser> => {
    // Normalize role
    const normalizedRole = userData && userData.role
      ? (userData.role.toLowerCase() === 'administrador' ? 'admin' : 'user') as 'admin' | 'user'
      : 'user' as const;
    
    // Normalize tier
    const normalizedTier = userData && userData.tier
      ? userData.tier.toLowerCase() as "super_admin" | "company_admin" | "consultant" | "technician"
      : 'technician' as const;
    
    const enhancedUser: AuthUser = {
      ...sessionUser,
      role: normalizedRole,
      tier: normalizedTier,
      company_id: userData?.company_id
    };
    
    return enhancedUser;
  }, []);

  // Function to refresh the session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🔄 Refreshing authentication session...");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Failed to refresh session:", error);
        return false;
      }
      
      if (data.session) {
        console.log("✅ Session refreshed successfully");
        
        // Update user data if needed
        if (data.user && (!user || user.id !== data.user.id)) {
          const userData = await fetchExtendedUser(data.user.id);
          const enhancedUser = await normalizeUserData(data.user, userData);
          
          setUser(enhancedUser);
          localStorage.setItem("authUser", JSON.stringify(enhancedUser));
        }
        
        return true;
      } else {
        console.warn("No session returned after refresh");
        return false;
      }
    } catch (err) {
      console.error("Error refreshing session:", err);
      return false;
    }
  }, [user, normalizeUserData]);

  // Simplified logout function
  const logout = useCallback(() => {
    console.log("Executing logout in useSessionManagement...");
    // Clear all authentication data
    localStorage.removeItem("authUser");
    setUser(null);
    // Navigate to auth page
    navigate("/auth");
  }, [navigate]);

  // Initialize auth when component mounts
  const initializeAuth = useCallback(async () => {
    console.log("🔄 Iniciando verificação de sessão...");
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (data?.session?.user) {
        console.log("✅ Sessão restaurada do Supabase");
        // Try to get the complete user data
        const userData = await fetchExtendedUser(data.session.user.id);
        const enhancedUser = await normalizeUserData(data.session.user, userData);

        console.log("Enhanced user with role and tier:", enhancedUser);
        setUser(enhancedUser);
        localStorage.setItem("authUser", JSON.stringify(enhancedUser));
      } else {
        console.log("No active session found");
      }
    } catch (error) {
      console.error("❌ Error initializing authentication:", error);
      toast.error("Erro ao verificar sessão. Faça login novamente.");
    } finally {
      setLoading(false);
    }
  }, [normalizeUserData]);

  // Set up auth state events listener
  const setupAuthStateListener = useCallback(() => {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔄 Auth state changed: ${event}`);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem("authUser");
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        try {
          setLoading(true);
          const userData = await fetchExtendedUser(session.user.id);
          const enhancedUser = await normalizeUserData(session.user, userData);

          console.log("Auth state changed - updated user:", enhancedUser);
          setUser(enhancedUser);
          localStorage.setItem("authUser", JSON.stringify(enhancedUser));
        } catch (err) {
          console.error("❌ Error fetching user data:", err);
          // Fallback to basic data if extended data fetch fails
          const basicUser: AuthUser = {
            ...session.user,
            role: 'user' as const,
            tier: 'technician' as const
          };
          setUser(basicUser);
          localStorage.setItem("authUser", JSON.stringify(basicUser));
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
  }, [normalizeUserData]);

  return {
    user,
    loading,
    logout,
    refreshSession,
    initializeAuth,
    setupAuthStateListener
  };
}
