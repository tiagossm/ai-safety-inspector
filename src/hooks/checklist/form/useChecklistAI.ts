
import { useState } from "react";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useChecklistAI() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [aiLoading, setAiLoading] = useState(false);

  // Generate checklist using AI
  const generateAIChecklist = async (form: NewChecklist) => {
    setAiLoading(true);
    try {
      // Get the current session JWT
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;
      
      if (sessionError || !jwt) {
        console.error("Session error:", sessionError);
        throw new Error("Você precisa estar autenticado para gerar um checklist com IA");
      }
      
      console.log("Calling AI to generate checklist based on prompt:", aiPrompt);
      
      // Prepare the request data
      const requestData = {
        prompt: aiPrompt,
        num_questions: numQuestions,
        category: form.category || 'general',
        user_id: form.user_id,
        company_id: form.company_id
      };
      
      // Use the Supabase Functions API directly to avoid content-type issues with FormData
      const { data, error } = await supabase.functions.invoke('generate-checklist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: requestData
      });
      
      if (error) {
        console.error("Error calling AI function:", error);
        throw error;
      }
      
      console.log("AI generated response:", data);
      
      if (data?.success) {
        toast.success("Checklist gerado com sucesso pela IA!");
        return data;
      } else {
        throw new Error(data?.error || "Erro ao gerar checklist com IA");
      }
    } catch (error) {
      console.error("Error generating AI checklist:", error);
      toast.error(`Erro ao gerar checklist com IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return null;
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
