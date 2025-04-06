import { useState, useEffect } from "react";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChecklistAI } from "@/hooks/checklist/form/useChecklistAI";
import { useChecklistImport } from "@/hooks/checklist/form/useChecklistImport";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

// This file is being replaced by the modular version in src/hooks/checklist/form/useChecklistSubmit.ts
// Keeping this file for backward compatibility until all imports are updated
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
        toast.error("Erro ao verificar sua sessão. Tente novamente.");
      }
    };
    
    checkSession();
  }, [refreshSession, navigate]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("Submission already in progress");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Refresh token before submission
      await refreshSession();
      
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast.error("Falha na autenticação. Por favor, faça login novamente.");
        setIsSubmitting(false);
        navigate("/auth");
        return;
      }
      
      if (!sessionData.session) {
        console.error("No active session found");
        toast.error("Você precisa estar autenticado para criar um checklist");
        setIsSubmitting(false);
        navigate("/auth");
        return;
      }
      
      // Update checklist data
      const form: NewChecklist = {
        title: "New Checklist",
        description: "Description",
        user_id: typedUser?.id,
        is_template: false,
        status_checklist: "ativo",
      };

      if (!form.user_id) {
        console.error("No user ID available");
        toast.error("Não foi possível identificar o usuário. Por favor, faça login novamente.");
        setIsSubmitting(false);
        navigate("/auth");
        return;
      }

      console.log("Submitting checklist with user ID:", form.user_id);
      const result = await createChecklist.mutateAsync(form);
      
      if (result) {
        toast.success("Checklist criado com sucesso!");
        navigate(`/checklists/${result.id}`);
      } else {
        toast.error("Erro ao criar checklist. Tente novamente.");
      }
      
    } catch (error) {
      console.error("Error in form submission:", error);
      let errorMessage = "Erro ao criar checklist";
      
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
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
