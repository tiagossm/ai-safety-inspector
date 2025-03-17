
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
            // Update the user with real data
            setUser({
              ...defaultUser,
              id: data.session.user.id,
              email: data.session.user.email || defaultUser.email,
              role: userData.role || defaultUser.role,
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
            setUser({
              ...defaultUser,
              id: adminData[0].id,
              email: adminData[0].email || defaultUser.email
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
  
  // More robust session refresh
  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error refreshing session:", error);
        return false;
      }
      
      if (data?.session) {
        return true;
      }
      
      // If no session, check if we have a valid user in the database
      if (user && user.id !== "default-admin-user") {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();
          
        return !!userData;
      }
      
      return false;
    } catch (error) {
      console.error("Error in refreshSession:", error);
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
