
import { useState } from "react";
import { toast } from "sonner";
import { AIAssistantType } from "@/types/AIAssistantType";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { supabase } from "@/integrations/supabase/client";

export { type AIAssistantType };

export function useChecklistAI() {
  const [prompt, setPrompt] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType | null>(null);
  const [openAIAssistant, setOpenAIAssistant] = useState<string | null>(null);

  const generateChecklist = async (checklistData: NewChecklistPayload) => {
    setIsGenerating(true);
    
    if (!checklistData.category) {
      toast.error("Category is required");
      setIsGenerating(false);
      return { success: false, error: "Category is required" };
    }

    if (!checklistData.company_id) {
      console.error("Company ID is required");
      return { success: false, error: "Company ID is required" };
    }
    
    try {
      const requestBody: any = {
        title: checklistData.title,
        description: checklistData.description,
        category: checklistData.category,
        companyId: checklistData.company_id, // Using correct property name for API
        questionCount: questionCount,
        prompt: prompt
      };
      
      if (openAIAssistant) {
        requestBody.assistantId = openAIAssistant;
      }
      
      const { data, error } = await supabase.functions.invoke('generate-checklist-v2', {
        body: requestBody
      });

      if (error) {
        console.error("Error in AI generation:", error);
        toast.error(`Erro na geração por IA: ${error.message}`);
        setIsGenerating(false);
        return { success: false, error: error.message };
      }

      if (!data || !data.success) {
        console.error("AI generation failed:", data);
        toast.error(data?.error || 'Failed to generate checklist');
        setIsGenerating(false);
        return { success: false, error: data?.error || 'Failed to generate checklist' };
      }
      
      const questions: ChecklistQuestion[] = data.questions || [];
      const groups: ChecklistGroup[] = data.groups || [];
      
      setIsGenerating(false);
      return { success: true, questions, groups, checklistData };
    } catch (error: any) {
      console.error('Error in AI generation:', error);
      toast.error(`Erro na geração por IA: ${error.message}`);
      setIsGenerating(false);
      return { success: false, error: error.message };
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
    generateChecklist
  };
}
