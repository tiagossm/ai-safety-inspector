
import { useState, useEffect } from "react";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChecklistAI } from "./useChecklistAI";
import { useChecklistImport } from "./useChecklistImport";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useChecklistSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const createChecklist = useCreateChecklist();
  const { generateAIChecklist } = useChecklistAI();
  const { importFromFile } = useChecklistImport();
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const typedUser = user as AuthUser | null;

  // Verify session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        await refreshSession();
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          console.log("Session verified in useChecklistSubmit");
          setSessionChecked(true);
        } else {
          console.error("No valid session found in useChecklistSubmit");
          toast.error("Sua sessão expirou. Faça login novamente.");
          navigate("/auth");
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };
    
    checkSession();
  }, [refreshSession, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("Submission already in progress");
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      // Refresh token before submission
      await refreshSession();
      
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error("No active session found");
        toast.error("Você precisa estar autenticado para criar um checklist");
        setIsSubmitting(false);
        navigate("/auth");
        return false;
      }
      
      // Update checklist data
      const form = {
        title: "New Checklist",
        description: "Description",
        user_id: typedUser?.id,
        is_template: false,
        status_checklist: "ativo",
      };

      const result = await createChecklist.mutateAsync(form);
      
      if (result) {
        toast.success("Checklist criado com sucesso!");
        navigate(`/checklists/${result.id}`);
        return true;
      }
      
      toast.error("Erro ao criar checklist");
      return false;
      
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
    sessionChecked
  };
}
