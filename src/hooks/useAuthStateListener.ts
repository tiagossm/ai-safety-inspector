import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { AuthUser } from "@/types/auth";
import { User } from "@supabase/supabase-js";

export function useAuthStateListener(
  setUser: (user: AuthUser | null | ((prev: AuthUser | null) => AuthUser | null)) => void,
  setLoading: (loading: boolean) => void,
  enhanceUserWithRoleTier: (sessionUser: User) => Promise<AuthUser>,
  fetchUserData: (userId: string) => Promise<any>
) {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          setLoading(true);
          // Fetch additional user data from the users table
          const userData = await fetchUserData(session.user.id);
          
          // Set default values if data is missing
          const userRole: "admin" | "user" = 
            (userData?.role === "admin") ? "admin" : "user";
          
          let userTier = userData?.tier as 
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
          setUser((prev) => {
            if (!prev) return null;
            return { ...session.user, role: prev.role, tier: prev.tier } as AuthUser;
          });
        }
      } else if (event === 'USER_UPDATED') {
        if (session?.user) {
          // Keep the existing role/tier when user is updated
          setUser((prev) => {
            if (!prev) return null;
            return { ...session.user, role: prev.role, tier: prev.tier } as AuthUser;
          });
        }
      } else if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          try {
            const enhancedUser = await enhanceUserWithRoleTier(session.user);
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
  }, []);
}
