
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

export type AIAssistantType = "general" | "workplace-safety" | "compliance" | "quality" | "checklist" | "openai";

export function useChecklistAI() {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType>("general");
  const [openAIAssistant, setOpenAIAssistant] = useState<string>("");

  const generateChecklist = async (checklistData: NewChecklistPayload): Promise<{ success: boolean, checklistId?: string }> => {
    try {
      setIsGenerating(true);
      
      // Create the checklist first
      const { data: checklist, error: checklistError } = await supabase
        .from("checklists")
        .insert({
          title: checklistData.title,
          description: checklistData.description,
          is_template: checklistData.is_template,
          status: checklistData.status,
          category: checklistData.category,
          company_id: checklistData.company_id,
          responsible_id: checklistData.responsible_id,
          user_id: checklistData.user_id,
          origin: 'ia'
        })
        .select()
        .single();
      
      if (checklistError) {
        throw checklistError;
      }

      // This is a placeholder for actual AI generation
      // In a real implementation, you would call an AI service endpoint
      // For now, we're just creating a checklist with sample questions
      
      const sampleQuestions = [
        {
          checklist_id: checklist.id,
          pergunta: "O item está em bom estado de conservação?",
          tipo_resposta: "sim/não",
          obrigatorio: true,
          ordem: 0,
          permite_foto: true
        },
        {
          checklist_id: checklist.id,
          pergunta: "Qual a data da última manutenção?",
          tipo_resposta: "texto",
          obrigatorio: true,
          ordem: 1
        },
        {
          checklist_id: checklist.id,
          pergunta: "Avalie a condição geral:",
          tipo_resposta: "seleção múltipla",
          obrigatorio: true,
          ordem: 2,
          opcoes: ["Excelente", "Bom", "Regular", "Ruim"]
        }
      ];
      
      // Insert the sample questions
      const { error: questionsError } = await supabase
        .from("checklist_itens")
        .insert(sampleQuestions);
      
      if (questionsError) {
        console.error("Error creating questions:", questionsError);
        // Don't throw here, as the checklist was created successfully
      }
      
      return {
        success: true,
        checklistId: checklist.id
      };
    } catch (error: any) {
      console.error("Error generating checklist with AI:", error);
      toast.error(`Error creating checklist: ${error.message}`);
      return { success: false };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    selectedAssistant,
    setSelectedAssistant,
    openAIAssistant,
    setOpenAIAssistant,
    generateChecklist
  };
}
