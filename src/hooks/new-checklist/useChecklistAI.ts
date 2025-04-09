
import { useState } from "react";
import { toast } from "sonner";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { supabase } from "@/integrations/supabase/client";

// Updated to match what's expected in components
export type AIAssistantType = 'general' | 'workplace-safety' | 'compliance' | 'quality' | 'checklist';

export const useChecklistAI = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType>('general');
  const [openAIAssistant, setOpenAIAssistant] = useState<boolean>(true);

  // Generate checklist with AI
  const generateChecklist = async (checklistData: NewChecklistPayload) => {
    try {
      setIsGenerating(true);
      
      // Basic validation
      if (!checklistData.title || !checklistData.company_id) {
        toast.error("Por favor, preencha os campos obrigatórios");
        return { success: false };
      }
      
      // This would typically call an AI service endpoint
      // For this demo, let's mock a response with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI-generated checklist data
      const generatedQuestions: ChecklistQuestion[] = [];
      const generatedGroups: ChecklistGroup[] = [
        {
          id: "group-1",
          title: "Seção Principal",
          order: 0
        }
      ];
      
      // Create sample questions
      for (let i = 0; i < questionCount; i++) {
        generatedQuestions.push({
          id: `ai-${Date.now()}-${i}`,
          text: `Questão de ${selectedAssistant} gerada por IA #${i + 1}?`,
          responseType: "yes_no",
          isRequired: true,
          options: [],
          weight: 1,
          allowsPhoto: false,
          allowsVideo: false,
          allowsAudio: false,
          allowsFiles: false,
          order: i,
          groupId: "group-1",
          displayNumber: `${i + 1}`
        });
      }
      
      return {
        success: true,
        checklistData,
        questions: generatedQuestions,
        groups: generatedGroups
      };
    } catch (error) {
      console.error("Error generating checklist:", error);
      toast.error("Erro ao gerar checklist com IA");
      return { success: false };
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
    generateChecklist
  };
};
