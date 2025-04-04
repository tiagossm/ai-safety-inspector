
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NewChecklistPayload } from '@/types/newChecklist';

export type AIAssistantType = 'general' | 'workplace-safety' | 'compliance' | 'quality';

interface GenerateResult {
  success: boolean;
  checklistData?: any;
  questions?: any[];
  groups?: any[];
  error?: string;
}

export function useChecklistAI() {
  const [prompt, setPrompt] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType>('general');
  const [openAIAssistant, setOpenAIAssistant] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateChecklist = async (checklistData: NewChecklistPayload): Promise<GenerateResult> => {
    setIsGenerating(true);

    try {
      if (!prompt.trim()) {
        toast.error("É necessário fornecer um prompt para gerar o checklist");
        return { success: false, error: "Prompt vazio" };
      }

      if (!checklistData.company_id) {
        toast.error("É necessário selecionar uma empresa");
        return { success: false, error: "Empresa não selecionada" };
      }

      if (!openAIAssistant) {
        toast.error("É necessário selecionar um assistente de IA");
        return { success: false, error: "Assistente não selecionado" };
      }

      console.log(`Generating checklist with ${questionCount} questions`);
      
      const { data, error } = await supabase.functions.invoke('generate-checklist', {
        body: {
          prompt,
          questionCount,
          checklistData,
          assistantId: openAIAssistant
        }
      });

      if (error) {
        console.error("Erro na função Edge:", error);
        toast.error(`Erro ao gerar checklist: ${error.message}`);
        return {
          success: false,
          error: error.message,
          checklistData,
          questions: [],
          groups: []
        };
      }

      if (!data || !data.success) {
        const fallbackError = data?.error || "Erro desconhecido ao gerar o checklist";
        console.error("Erro na resposta:", fallbackError);
        toast.error(fallbackError);
        return {
          success: false,
          error: fallbackError,
          checklistData: data?.checklistData || checklistData,
          questions: data?.questions || [],
          groups: data?.groups || []
        };
      }

      toast.success("Checklist gerado com sucesso!");
      return {
        success: true,
        checklistData: {
          ...checklistData,
          title: data.checklistData.title || checklistData.title,
          description: data.checklistData.description || checklistData.description
        },
        questions: data.questions || [],
        groups: data.groups || []
      };
    } catch (error: any) {
      console.error("Erro inesperado:", error);
      toast.error(`Erro ao gerar checklist: ${error.message || "Erro desconhecido"}`);
      return {
        success: false,
        error: error.message,
        checklistData,
        questions: [],
        groups: []
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    prompt,
    setPrompt,
    questionCount,
    setQuestionCount,
    selectedAssistant,
    setSelectedAssistant,
    openAIAssistant,
    setOpenAIAssistant,
    isGenerating,
    generateChecklist
  };
}
