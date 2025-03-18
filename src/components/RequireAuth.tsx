
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, refreshSession } = useAuth();
  const location = useLocation();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to refresh the session
        await refreshSession();
        
        // Check if there's a valid session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setHasValidSession(false);
        } else if (data?.session) {
          console.log("Valid session found in RequireAuth");
          setHasValidSession(true);
        } else {
          console.warn("No valid session found in RequireAuth");
          setHasValidSession(false);
        }
      } catch (err) {
        console.error("Unexpected error in session check:", err);
        setHasValidSession(false);
      } finally {
        setIsCheckingSession(false);
      }
    };
    
    checkSession();
  }, [refreshSession]);

  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasValidSession && !user) {
    // Redirect to the login page but save the current location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
