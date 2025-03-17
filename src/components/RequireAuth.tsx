
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to the login page but save the current location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
