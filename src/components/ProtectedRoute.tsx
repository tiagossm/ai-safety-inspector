
import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export type UserTier = "super_admin" | "company_admin" | "consultant" | "technician" | "user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: UserTier[];
}

export function ProtectedRoute({
  children,
  requiredTier = ["super_admin", "company_admin", "consultant", "technician", "user"]
}: ProtectedRouteProps) {
  const { user, loading } = useContext(AuthContext);
  
  // Simple loading state, but no restrictions on access
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // Always render children regardless of authentication state
  return <>{children}</>;
}
