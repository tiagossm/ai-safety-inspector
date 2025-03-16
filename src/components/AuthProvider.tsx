
import { createContext, useContext, useEffect } from "react";
import { AuthUser } from "@/hooks/auth/useAuthState";
import { useSessionManagement } from "@/hooks/auth/useSessionManagement";

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
  const {
    user,
    loading,
    logout,
    refreshSession,
    initializeAuth,
    setupAuthStateListener
  } = useSessionManagement();

  // Check session when component mounts
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Set up auth state events
  useEffect(() => {
    const { data: authListener } = setupAuthStateListener();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [setupAuthStateListener]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};
