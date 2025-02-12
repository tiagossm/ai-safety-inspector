import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("userToken") // Simula autenticação baseada no token salvo
  );

  const login = () => {
    localStorage.setItem("userToken", "fake-token");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    setIsAuthenticated(false);
  };

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("userToken"));
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
