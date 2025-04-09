import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NewChecklistPayload } from "@/types/newChecklist";

export type AIAssistantType = "checklist" | "questions";

/**
 * Hook for generating checklists and questions using AI
 */
export function useChecklistAI() {
  const [prompt, setPrompt] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType>("checklist");
  const [openAIAssistant, setOpenAIAssistant] = useState("");

  // Fix companyId references - use company_id instead
  const generateChecklist = async (checklistData: NewChecklistPayload): Promise<any> => {
    try {
      setIsGenerating(true);
      
      // Make API call to generate checklist
      const { data, error } = await supabase.functions.invoke('generate-checklist', {
        body: {
          prompt,
          numQuestions: questionCount,
          assistant: openAIAssistant,
          category: checklistData.category,
          company_id: checklistData.company_id, // Fixed this line
          assistantType: selectedAssistant
        }
      });

      if (error) {
        console.error("Error in AI generation:", error);
        toast.error(`Erro ao gerar checklist: ${error.message}`);
        return { success: false, error: error.message };
      }

      if (!data || !data.success) {
        console.error("AI generation failed:", data);
        toast.error(data?.error || 'Falha ao gerar checklist');
        return { success: false, error: data?.error || 'Falha ao gerar checklist' };
      }
      
      return { success: true, checklistData: data.checklistData, questions: data.questions, groups: data.groups };
    } catch (error: any) {
      console.error("Error generating checklist:", error);
      toast.error(`Erro ao gerar checklist: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  };

  // Fix companyId references - use company_id instead
  const generateChecklistQuestions = async (
    prompt: string,
    checklistData: NewChecklistPayload
  ): Promise<any> => {
    try {
      setIsGenerating(true);
      
      // Validate prompt
      if (!prompt.trim()) {
        toast.error("Por favor, digite um prompt");
        return { success: false, error: "Prompt não pode estar vazio" };
      }
      
      const { data, error } = await supabase.functions.invoke('generate-checklist-questions', {
        body: {
          prompt,
          numQuestions: questionCount,
          assistant: openAIAssistant,
          company_id: checklistData.company_id, // Fixed this line
          category: checklistData.category
        }
      });

      if (error) {
        console.error("Error generating questions:", error);
        toast.error(`Erro ao gerar perguntas: ${error.message}`);
        return { success: false, error: error.message };
      }

      if (!data || !data.success) {
        console.error("Failed to generate questions:", data);
        toast.error(data?.error || 'Falha ao gerar perguntas');
        return { success: false, error: data?.error || 'Falha ao gerar perguntas' };
      }

      toast.success("Perguntas geradas com sucesso!");
      return { success: true, questions: data.questions };
    } catch (error: any) {
      console.error("Error generating checklist questions:", error);
      toast.error(`Erro ao gerar perguntas: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    prompt,
    setPrompt,
    questionCount,
    setQuestionCount,
    isGenerating,
    selectedAssistant,
    setSelectedAssistant,
    openAIAssistant,
    setOpenAIAssistant,
    generateChecklist,
    generateChecklistQuestions
  };
}
