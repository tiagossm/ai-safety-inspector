
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { AuthUser } from "@/types/auth";

export function useSessionInit(
  setUser: (user: AuthUser | null) => void,
  setLoading: (loading: boolean) => void,
  enhanceUserWithRoleTier: (sessionUser: any) => Promise<AuthUser>,
  handleAuthError: (error: any) => Promise<void>
) {
  const navigate = useNavigate();

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
            // Enhance user with role and tier
            const enhancedUser = await enhanceUserWithRoleTier(session.user);
            setUser(enhancedUser);
            
            // Redirect based on user tier if on auth page
            if (window.location.pathname === "/auth") {
              if (enhancedUser.tier === "super_admin") {
                navigate("/admin/dashboard");
              } else {
                navigate("/dashboard");
              }
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

    return () => {
      mounted = false;
    };
  }, []);
}
