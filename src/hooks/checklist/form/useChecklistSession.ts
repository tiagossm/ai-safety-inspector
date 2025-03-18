
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

export function useChecklistSession() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  // Verify session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        await refreshSession();
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          console.log("Session verified in useChecklistSession");
          setSessionChecked(true);
        } else {
          console.error("No valid session found in useChecklistSession");
          toast.error("Sua sessão expirou. Faça login novamente.");
          navigate("/auth");
        }
      } catch (error) {
        console.error("Session check error:", error);
        toast.error("Erro ao verificar sua sessão. Tente novamente.");
      }
    };
    
    checkSession();
  }, [refreshSession, navigate]);

  // Function to verify session before an operation
  const verifySession = async () => {
    try {
      // Refresh token before operation
      await refreshSession();
      
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast.error("Falha na autenticação. Por favor, faça login novamente.");
        navigate("/auth");
        return false;
      }
      
      if (!sessionData.session) {
        console.error("No active session found");
        toast.error("Você precisa estar autenticado para criar um checklist");
        navigate("/auth");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error verifying session:", error);
      return false;
    }
  };

  return {
    sessionChecked,
    verifySession
  };
}
