
import { createContext, useContext } from "react";
import type { AuthContextType } from "@/types/auth";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useSessionInit } from "@/hooks/useSessionInit";
import { useAuthStateListener } from "@/hooks/useAuthStateListener";

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  logout: async () => {} 
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    setUser,
    loading,
    setLoading,
    logout,
    enhanceUserWithRoleTier,
    fetchUserData,
    handleAuthError
  } = useSessionManager();

  // Initialize session on component mount
  useSessionInit(setUser, setLoading, enhanceUserWithRoleTier, handleAuthError);

  // Listen for auth state changes
  useAuthStateListener(setUser, setLoading, enhanceUserWithRoleTier, fetchUserData);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
