
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useChecklistAuth() {
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const [tokenRefreshed, setTokenRefreshed] = useState(false);
  
  // Check and refresh JWT token on component mount
  useEffect(() => {
    const refreshToken = async () => {
      try {
        await refreshSession();
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Failed to refresh token:", error);
          toast.error("Erro ao atualizar sua sessão");
          return false;
        } else if (data?.session) {
          console.log("Session token refreshed successfully");
          setTokenRefreshed(true);
          
          // Log session details for debugging
          console.log("Session details:", {
            expiresAt: data.session.expires_at,
            expiryFormatted: data.session.expires_at 
              ? new Date(data.session.expires_at * 1000).toLocaleString() 
              : 'unknown',
            userId: data.session.user?.id,
            tokenLength: data.session.access_token.length
          });
          
          return true;
        } else {
          console.warn("No active session found");
          toast.error("Você não está autenticado");
          navigate("/auth");
          return false;
        }
      } catch (err) {
        console.error("Token refresh error:", err);
        return false;
      }
    };
    
    refreshToken();
    
    // Setup a timer to refresh the token every 10 minutes
    const intervalId = setInterval(() => {
      console.log("Refreshing token (scheduled)");
      refreshToken();
    }, 10 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refreshSession, navigate]);

  return { user, refreshSession, tokenRefreshed };
}
