
import { useState } from "react";
import { ChecklistGroup, ChecklistQuestion, NewChecklistPayload } from "@/types/newChecklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type for AI assistant specializations
export type AIAssistantType = "workplace-safety" | "compliance" | "quality" | "general";

export function useChecklistAI() {
  const [prompt, setPrompt] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType>("general");

  // Generate checklist using AI
  const generateChecklist = async (checklistData: NewChecklistPayload): Promise<{
    success: boolean;
    checklistData?: NewChecklistPayload;
    questions?: ChecklistQuestion[];
    groups?: ChecklistGroup[];
  }> => {
    try {
      setIsGenerating(true);
      
      if (!prompt.trim()) {
        toast.error("Por favor, forneça um prompt para gerar o checklist");
        return { success: false };
      }
      
      console.log("Generating checklist with AI:", {
        prompt,
        questionCount,
        assistant: selectedAssistant
      });

      // Call Supabase Edge Function for AI generation
      const { data, error } = await supabase.functions.invoke("generate-checklist", {
        body: {
          prompt,
          num_questions: questionCount,
          category: selectedAssistant,
          company_id: checklistData.companyId
        }
      });
      
      if (error) {
        console.error("Error calling generate-checklist function:", error);
        toast.error("Erro ao gerar checklist com IA");
        return { success: false };
      }
      
      console.log("AI generation successful:", data);
      
      // Generate group structure based on assistant type
      const groups: ChecklistGroup[] = getDefaultGroups(selectedAssistant);
      
      // Process generated questions
      const questions: ChecklistQuestion[] = data.questions.map((q: any, index: number) => {
        // Determine which group this question should belong to
        const groupIndex = index % groups.length;
        const groupId = groups[groupIndex].id;
        
        return {
          id: `new-${Date.now()}-${index}`,
          text: q.text || `Question ${index + 1}`,
          responseType: mapResponseType(q.type || 'yes_no'),
          isRequired: q.required !== undefined ? q.required : true,
          options: q.options || (q.type === 'multiple_choice' ? ["Opção 1", "Opção 2"] : undefined),
          hint: q.hint || "",
          weight: q.weight || 1,
          groupId,
          parentQuestionId: q.parentId || undefined,
          conditionValue: q.conditionValue || undefined,
          allowsPhoto: q.allowsPhoto || false,
          allowsVideo: q.allowsVideo || false,
          allowsAudio: q.allowsAudio || false,
          order: index
        };
      });
      
      // Update checklist data with any AI-generated suggestions
      const updatedChecklistData: NewChecklistPayload = {
        ...checklistData,
        title: checklistData.title || `Checklist: ${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}`,
        description: checklistData.description || `Checklist gerado automaticamente com base em: ${prompt}`,
        category: checklistData.category || selectedAssistant
      };
      
      return {
        success: true,
        checklistData: updatedChecklistData,
        questions,
        groups
      };
    } catch (error) {
      console.error("Error in generateChecklist:", error);
      toast.error(`Erro ao gerar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      return { success: false };
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Helper functions
  
  // Get default group structure based on assistant type
  const getDefaultGroups = (assistantType: AIAssistantType): ChecklistGroup[] => {
    let groups: string[] = [];
    
    switch (assistantType) {
      case "workplace-safety":
        groups = ["EPIs", "Ambiente de Trabalho", "Procedimentos", "Treinamentos"];
        break;
      case "compliance":
        groups = ["Documentação", "Processos", "Registros", "Auditorias"];
        break;
      case "quality":
        groups = ["Controle de Processo", "Inspeção", "Não-conformidades", "Melhorias"];
        break;
      default:
        groups = ["Geral", "Específico", "Opcional"];
    }
    
    return groups.map((title, index) => ({
      id: `group-${index + 1}`,
      title,
      order: index
    }));
  };
  
  // Map AI response type to our type system
  const mapResponseType = (type: string): ChecklistQuestion['responseType'] => {
    const typeMap: Record<string, ChecklistQuestion['responseType']> = {
      'yes_no': 'yes_no',
      'sim/não': 'yes_no',
      'multiple_choice': 'multiple_choice',
      'múltipla escolha': 'multiple_choice',
      'numeric': 'numeric',
      'numérico': 'numeric',
      'text': 'text',
      'texto': 'text',
      'photo': 'photo',
      'foto': 'photo',
      'signature': 'signature',
      'assinatura': 'signature'
    };
    
    return typeMap[type.toLowerCase()] || 'text';
  };

  return {
    prompt,
    setPrompt,
    questionCount,
    setQuestionCount,
    isGenerating,
    selectedAssistant,
    setSelectedAssistant,
    generateChecklist
  };
}
