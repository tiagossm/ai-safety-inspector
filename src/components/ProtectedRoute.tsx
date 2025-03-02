
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: ("super_admin" | "company_admin" | "consultant" | "technician")[];
}

export function ProtectedRoute({ 
  children, 
  requiredTier = ["super_admin", "company_admin", "consultant", "technician"] 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check for tier-based access control
  if (user.tier && !requiredTier.includes(user.tier)) {
    // Redirect to appropriate dashboard based on tier
    if (user.tier === "super_admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
