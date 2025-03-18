
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

export function useChecklistSession() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  // Enhanced session check with better error handling and logging
  const checkSession = useCallback(async () => {
    try {
      console.log("📝 Verificando sessão do usuário...");
      
      // Attempt to refresh the token first
      const refreshResult = await refreshSession();
      
      // Get current session after refresh attempt
      const { data } = await supabase.auth.getSession();
      
      if (data?.session) {
        console.log("✅ Sessão verificada com sucesso em useChecklistSession");
        setSessionChecked(true);
        setIsSessionValid(true);
        return true;
      } else {
        console.error("❌ Nenhuma sessão válida encontrada em useChecklistSession", 
          { tokenRefreshed: refreshResult });
        
        setSessionChecked(true);
        setIsSessionValid(false);
        
        // Only show toast and navigate if we're not already on the auth page
        if (window.location.pathname !== "/auth") {
          toast.error("Sua sessão expirou. Faça login novamente.");
          navigate("/auth");
        }
        
        return false;
      }
    } catch (error) {
      console.error("❌ Erro ao verificar sessão:", error);
      
      setSessionChecked(true);
      setIsSessionValid(false);
      
      // Only show toast and navigate if we're not already on the auth page
      if (window.location.pathname !== "/auth") {
        toast.error("Erro ao verificar sua sessão. Tente novamente.");
        navigate("/auth");
      }
      
      return false;
    }
  }, [refreshSession, navigate]);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Enhanced function to verify session before an operation
  const verifySession = useCallback(async () => {
    try {
      console.log("🔐 Verificando sessão antes da operação...");
      
      // Refresh token before operation
      const refreshResult = await refreshSession();
      console.log("🔄 Token refreshed:", refreshResult);
      
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("❌ Erro na sessão:", sessionError);
        
        // Only show toast and navigate if we're not already on the auth page
        if (window.location.pathname !== "/auth") {
          toast.error("Falha na autenticação. Por favor, faça login novamente.");
          navigate("/auth");
        }
        
        return false;
      }
      
      if (!sessionData.session) {
        console.error("❌ Nenhuma sessão ativa encontrada");
        
        // Only show toast and navigate if we're not already on the auth page  
        if (window.location.pathname !== "/auth") {
          toast.error("Você precisa estar autenticado para criar um checklist");
          navigate("/auth");
        }
        
        return false;
      }
      
      console.log("✅ Sessão validada:", !!sessionData.session, "Token refreshed:", refreshResult);
      return true;
    } catch (error) {
      console.error("❌ Erro ao verificar sessão:", error);
      return false;
    }
  }, [refreshSession, navigate]);

  return {
    sessionChecked,
    isSessionValid,
    checkSession,
    verifySession
  };
}
