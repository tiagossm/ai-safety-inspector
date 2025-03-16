
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthUser } from "@/hooks/auth/useAuthState";
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();
  
  // Simplified logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  // Always successful session refresh
  const refreshSession = async (): Promise<boolean> => {
    return true;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading: false, 
        logout, 
        refreshSession 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
