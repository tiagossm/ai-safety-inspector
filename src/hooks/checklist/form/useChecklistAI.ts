
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useChecklistAI() {
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const typedUser = user as AuthUser | null;

  const generateAIChecklist = async (form: NewChecklist) => {
    try {
      setAiLoading(true);
      
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;
      
      if (sessionError || !jwt) {
        console.error("Session error:", sessionError);
        toast.error("Você precisa estar autenticado para gerar um checklist com IA");
        return false;
      }
      
      // Ensure user_id is set
      if (!form.user_id && typedUser?.id) {
        form.user_id = typedUser.id;
      }
      
      const { data, error } = await supabase.functions.invoke('generate-checklist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          num_questions: numQuestions,
          form: form
        })
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (err) {
      console.error("Error generating AI checklist:", err);
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('JWT')) {
          toast.error("Sua sessão expirou, faça login novamente");
        } else {
          toast.error(`Erro ao gerar checklist: ${err.message}`);
        }
      } else {
        toast.error("Erro ao gerar checklist com IA");
      }
      return false;
    } finally {
      setAiLoading(false);
    }
  };

  return {
    aiPrompt,
    setAiPrompt,
    numQuestions,
    setNumQuestions,
    aiLoading,
    generateAIChecklist
  };
}
