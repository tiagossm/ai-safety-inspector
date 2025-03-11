
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
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast.error("Você precisa estar autenticado para gerar um checklist com IA");
        setAiLoading(false);
        return false;
      }
      
      if (!sessionData.session) {
        console.error("No active session");
        toast.error("Sessão inválida. Faça login novamente.");
        setAiLoading(false);
        return false;
      }
      
      const jwt = sessionData.session.access_token;
      
      console.log("JWT token length:", jwt.length, "User ID:", typedUser?.id);
      console.log("User details for AI generation:", {
        role: typedUser?.role,
        tier: typedUser?.tier
      });
      
      // Ensure user_id is set
      if (!form.user_id && typedUser?.id) {
        form.user_id = typedUser.id;
        console.log("Added user_id to form:", form.user_id);
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
          category: form.category || 'general',
          user_id: form.user_id,
          company_id: form.company_id
        })
      });
      
      if (error) {
        console.error("Edge function error:", error);
        if (error.message && (error.message.includes('401') || error.message.includes('JWT'))) {
          toast.error("Sua sessão expirou, faça login novamente");
        } else {
          toast.error(`Erro ao gerar checklist: ${error.message}`);
        }
        setAiLoading(false);
        return false;
      }
      
      console.log("AI generation successful:", data);
      return data;
    } catch (err: any) {
      console.error("Error generating AI checklist:", err);
      if (err.message?.includes('401') || err.message?.includes('JWT')) {
        toast.error("Sua sessão expirou, faça login novamente");
      } else {
        toast.error(`Erro ao gerar checklist: ${err.message}`);
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
