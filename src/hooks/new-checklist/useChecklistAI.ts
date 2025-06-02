
import { useState } from "react";
import { toast } from "sonner";
import { AIAssistantType } from "@/types/AIAssistantType";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { supabase } from "@/integrations/supabase/client";
import { handleError, validateRequiredFields } from "@/utils/errorHandling";
import { normalizeAIResponseType } from "@/utils/responseTypeMap";

export { type AIAssistantType };

export function useChecklistAI() {
  const [prompt, setPrompt] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType | null>(null);
  const [openAIAssistant, setOpenAIAssistant] = useState<string | null>(null);

  const generateChecklist = async (checklistData: NewChecklistPayload) => {
    setIsGenerating(true);
    
    // Validar campos obrigatórios
    if (!validateRequiredFields({
      categoria: checklistData.category,
      empresa: checklistData.company_id
    })) {
      setIsGenerating(false);
      return { success: false, error: "Campos obrigatórios não preenchidos" };
    }
    
    try {
      console.log("Iniciando geração de checklist por IA com dados:", checklistData);
      
      const requestBody: any = {
        title: checklistData.title,
        description: checklistData.description,
        category: checklistData.category,
        companyId: checklistData.company_id,
        questionCount: questionCount,
        prompt: prompt
      };
      
      if (openAIAssistant) {
        requestBody.assistantId = openAIAssistant;
      }
      
      console.log("Enviando requisição para generate-checklist-v2:", requestBody);
      
      const { data, error } = await supabase.functions.invoke('generate-checklist-v2', {
        body: requestBody
      });

      console.log("Resposta de generate-checklist-v2:", data, error);

      if (error) {
        throw new Error(`Erro na geração por IA: ${error.message || "Erro desconhecido"}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Falha ao gerar checklist');
      }
      
      // Normalizar tipos de resposta das perguntas vindas da IA
      const questions: ChecklistQuestion[] = (data.questions || []).map((q: any, index: number) => ({
        ...q,
        responseType: normalizeAIResponseType(q.responseType || 'text'),
        id: q.id || `ai-${Date.now()}-${index}`,
        order: q.order !== undefined ? q.order : index
      }));
      
      const groups: ChecklistGroup[] = data.groups || [];
      
      console.log(`Geração bem-sucedida! Recebidas ${questions.length} perguntas e ${groups.length} grupos`);
      console.log("Tipos de resposta normalizados:", questions.map(q => `${q.text}: ${q.responseType}`));
      
      toast.success("Checklist gerado com sucesso!");
      return { success: true, questions, groups, checklistData };
    } catch (error: any) {
      handleError(error, "Erro na geração por IA");
      return { success: false, error: error.message || "Erro desconhecido" };
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
}
