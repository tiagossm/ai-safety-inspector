
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthUser } from "@/hooks/auth/useAuthState";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  refreshSession: async () => false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch complete user data
  async function fetchExtendedUser(userId: string): Promise<any | null> {
    try {
      console.log("Fetching extended user data for:", userId);
      const { data, error } = await supabase
        .from("users")
        .select("id, company_id, name, role, tier")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user details:", error);
        return null;
      }
      
      console.log("Extended user data:", data);
      return data;
    } catch (err) {
      console.error("Error fetching user data:", err);
      return null;
    }
  }
  
  // Function to refresh the session
  const refreshSession = async (): Promise<boolean> => {
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
          
          // Normalize role
          const normalizedRole = userData && userData.role
            ? (userData.role.toLowerCase() === 'administrador' ? 'admin' : 'user') as 'admin' | 'user'
            : 'user' as const;
          
          // Normalize tier
          const normalizedTier = userData && userData.tier
            ? userData.tier.toLowerCase() as "super_admin" | "company_admin" | "consultant" | "technician"
            : 'technician' as const;
          
          const enhancedUser: AuthUser = {
            ...data.user,
            role: normalizedRole,
            tier: normalizedTier,
            company_id: userData?.company_id
          };
          
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
  };

  // Check session when component mounts
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔄 Iniciando verificação de sessão...");
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session?.user) {
          console.log("✅ Sessão restaurada do Supabase");
          // Try to get the complete user data
          const userData = await fetchExtendedUser(data.session.user.id);
          
          // Normalize role according to type definition
          const normalizedRole = userData && userData.role
            ? (userData.role.toLowerCase() === 'administrador' ? 'admin' : 'user') as 'admin' | 'user'
            : 'user' as const;
          
          // Normalize tier according to type definition
          const normalizedTier = userData && userData.tier
            ? userData.tier.toLowerCase() as "super_admin" | "company_admin" | "consultant" | "technician"
            : 'technician' as const;
          
          const enhancedUser: AuthUser = {
            ...data.session.user,
            role: normalizedRole,
            tier: normalizedTier,
            company_id: userData?.company_id
          };

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
    };

    initializeAuth();
  }, []);

  // Set up auth state events
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
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
          
          // Normalize role according to type definition
          const normalizedRole = userData && userData.role
            ? (userData.role.toLowerCase() === 'administrador' ? 'admin' : 'user') as 'admin' | 'user'
            : 'user' as const;
          
          // Normalize tier according to type definition
          const normalizedTier = userData && userData.tier
            ? userData.tier.toLowerCase() as "super_admin" | "company_admin" | "consultant" | "technician"
            : 'technician' as const;

          const enhancedUser: AuthUser = {
            ...session.user,
            role: normalizedRole,
            tier: normalizedTier,
            company_id: userData?.company_id
          };

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

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Simplify the logout function to avoid async issues
  const logout = () => {
    console.log("Executing logout in AuthProvider...");
    // Clear all authentication data
    localStorage.removeItem("authUser");
    setUser(null);
    // Navigate to auth page
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};
