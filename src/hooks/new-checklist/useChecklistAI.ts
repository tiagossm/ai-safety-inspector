
import { useState, useCallback } from "react";
import { NewChecklistPayload } from "@/types/newChecklist";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define AIAssistantType for export
export type AIAssistantType = "default" | "nr-specialist" | "safety-expert" | "custom";

export const useChecklistAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [openAIAssistant, setOpenAIAssistant] = useState<string>("gpt-4");
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType>("default");
  const isGenerating = isLoading;

  const generateChecklist = useCallback(async (
    aiPrompt: string,
    checklistData: NewChecklistPayload,
    openAIAssistant = "gpt-3.5-turbo",
    numQuestions = 10
  ) => {
    if (!aiPrompt) {
      toast.error("Por favor, forneça um prompt para geração do checklist");
      return null;
    }

    if (!checklistData.company_id) { // Fixed: companyId -> company_id
      toast.error("Por favor, selecione uma empresa");
      return null;
    }

    try {
      setIsLoading(true);
      
      // Call to AI service
      const { data, error } = await fetch("/api/ai/generateChecklist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          title: checklistData.title || "Checklist Gerado por IA",
          model: openAIAssistant,
          numQuestions,
          checklistData
        }),
      }).then(res => res.json());
      
      if (error) {
        console.error("Error generating checklist:", error);
        toast.error("Erro ao gerar checklist com IA");
        return null;
      }
      
      const { checklistId } = data;
      
      if (!checklistId) {
        toast.error("Erro ao criar checklist");
        return null;
      }
      
      // Log successful creation
      const { error: logError } = await supabase
        .from("checklist_history")
        .insert({
          checklist_id: checklistId,
          user_id: supabase.auth.getUser()?.data?.user?.id,
          action: "create",
          details: `Checklist criado com IA usando assistente ${openAIAssistant}`
        });
      
      if (logError) {
        console.warn("Error logging checklist creation:", logError);
      }
      
      toast.success("Checklist gerado com sucesso!");
      return { success: true, checklistId };
      
    } catch (error) {
      console.error("Error in generateChecklist:", error);
      toast.error("Erro ao gerar checklist");
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    isLoading,
    isGenerating,
    selectedAssistant,
    setSelectedAssistant,
    openAIAssistant,
    setOpenAIAssistant,
    generateChecklist 
  };
};
