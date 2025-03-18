
import { createContext, useContext, useState, useEffect } from "react";
import { AuthUser } from "@/hooks/auth/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  logout: async () => {},
  refreshSession: async () => true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Define a type guard to check if a string is a valid role
  const isValidRole = (role: string): role is AuthUser["role"] => {
    return ['super_admin', 'company_admin', 'consultant', 'technician', 'user'].includes(role);
  };

  // Create a default admin user for full access
  const defaultUser: AuthUser = {
    id: "default-admin-user",
    aud: "authenticated",
    role: "super_admin",
    tier: "super_admin",
    email: "admin@example.com",
    phone: "",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    identities: []
  };
  
  const [user, setUser] = useState<AuthUser | null>(defaultUser);
  const [loading, setLoading] = useState(false);
  
  // On mount, check if we have a real Supabase user
  useEffect(() => {
    const checkRealUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          console.log("Found authenticated user:", data.session.user.id);
          
          // Check if this user exists in the users table
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.session.user.id)
            .single();
            
          if (userData) {
            // Ensure role is one of the valid enum values
            const userRole = userData.role?.toLowerCase() || "";
            let validRole: AuthUser["role"] = "user"; // Default to user
            
            if (isValidRole(userRole)) {
              validRole = userRole as AuthUser["role"];
            } else if (userRole === "administrador") {
              validRole = "super_admin";
            }
            
            // Update the user with real data
            setUser({
              ...defaultUser,
              id: data.session.user.id,
              email: data.session.user.email || defaultUser.email,
              role: validRole,
              tier: userData.tier || defaultUser.tier
            });
            console.log("Using authenticated user from database:", userData.id);
          }
        } else {
          // If no authenticated user, try to find an admin in the database
          const { data: adminData } = await supabase
            .from("users")
            .select("*")
            .eq("role", "super_admin")
            .limit(1);
            
          if (adminData && adminData.length > 0) {
            // Use the first admin user found
            const validRole: AuthUser["role"] = isValidRole(adminData[0].role) 
              ? adminData[0].role as AuthUser["role"] 
              : "super_admin";
              
            setUser({
              ...defaultUser,
              id: adminData[0].id,
              email: adminData[0].email || defaultUser.email,
              role: validRole
            });
            console.log("Using admin user from database:", adminData[0].id);
          }
        }
      } catch (error) {
        console.error("Error checking real user:", error);
      }
    };
    
    checkRealUser();
  }, []);
  
  // Simplified logout function that doesn't use navigate
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/auth"; // Use direct location change instead of navigate
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  // More robust session refresh that explicitly requests a token refresh
  const refreshSession = async (): Promise<boolean> => {
    setLoading(true);
    try {
      console.log("🔄 Solicitando renovação de sessão...");
      
      // Explicitly try to refresh the token first
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error("❌ Erro ao renovar sessão:", refreshError);
        
        // Try to get the current session as a fallback
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          console.error("❌ Sessão inválida ou expirada:", sessionError);
          setLoading(false);
          return false;
        }
        
        // We have a session but couldn't refresh - might work for some operations
        console.log("⚠️ Usando sessão existente (sem renovação)");
        return true;
      }
      
      if (refreshData.session) {
        console.log("✅ Sessão renovada com sucesso!");
        console.log("🔒 Expiração:", new Date(refreshData.session.expires_at * 1000).toLocaleString());
        
        // Update the user with the refreshed session data if needed
        if (refreshData.user && refreshData.user.id !== user?.id) {
          setUser({
            ...refreshData.user as AuthUser,
            role: user?.role || "user",
            tier: user?.tier || "technician"
          });
        }
        
        setLoading(false);
        return true;
      }
      
      console.log("⚠️ Sem sessão após tentativa de renovação");
      setLoading(false);
      return false;
    } catch (error) {
      console.error("❌ Erro ao renovar sessão:", error);
      setLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        logout, 
        refreshSession 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
