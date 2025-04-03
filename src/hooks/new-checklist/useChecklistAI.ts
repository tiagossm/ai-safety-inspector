
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NewChecklistPayload } from '@/types/newChecklist';

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
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [openAIAssistant, setOpenAIAssistant] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateChecklist = async (checklistData: NewChecklistPayload): Promise<GenerateResult> => {
    setIsGenerating(true);
    
    try {
      if (!prompt.trim()) {
        toast.error("É necessário fornecer um prompt para gerar o checklist");
        return { success: false, error: "Prompt vazio" };
      }
      
      if (!checklistData.companyId) {
        toast.error("É necessário selecionar uma empresa");
        return { success: false, error: "Empresa não selecionada" };
      }
      
      if (!openAIAssistant) {
        toast.error("É necessário selecionar um assistente de IA");
        return { success: false, error: "Assistente não selecionado" };
      }
      
      console.log("Generating checklist with AI:", {
        prompt,
        questionCount,
        checklistData,
        assistantId: openAIAssistant || undefined
      });
      
      // Chamar a Edge Function
      const { data, error } = await supabase.functions.invoke('generate-checklist', {
        body: {
          prompt,
          questionCount,
          checklistData,
          assistantId: openAIAssistant || undefined
        }
      });
      
      if (error) {
        console.error("Error generating checklist with AI:", error);
        toast.error(`Erro ao gerar checklist: ${error.message}`);
        return { 
          success: false, 
          error: error.message,
          // Return empty arrays for questions and groups to avoid undefined errors
          checklistData: {
            ...checklistData,
            title: checklistData.title || "Erro na geração",
            description: "Houve um erro ao gerar o conteúdo."
          },
          questions: [],
          groups: []
        };
      }
      
      if (!data || !data.success) {
        const errorMessage = data?.error || "Erro desconhecido ao gerar o checklist";
        console.error("AI generation failed:", errorMessage);
        toast.error(`Falha na geração: ${errorMessage}`);
        
        // Return the data from the backend even on error, as it contains fallback empty arrays
        return { 
          success: false, 
          error: errorMessage,
          checklistData: data?.checklistData || checklistData,
          questions: data?.questions || [],
          groups: data?.groups || []
        };
      }
      
      console.log("AI generation successful:", data);
      
      // Se chegou até aqui, foi bem-sucedido
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
    } catch (error) {
      console.error("Error in generateChecklist:", error);
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
