
import { useState, useEffect } from "react";
import { ChecklistGroup, ChecklistQuestion, NewChecklistPayload } from "@/types/newChecklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOpenAIAssistants } from "@/hooks/useOpenAIAssistants";

// Type for AI assistant specializations
export type AIAssistantType = "workplace-safety" | "compliance" | "quality" | "general";

export function useChecklistAI() {
  const [prompt, setPrompt] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType>("general");
  const [openAIAssistant, setOpenAIAssistant] = useState<string>("");
  const { assistants, loading: loadingAssistants, loadAssistants } = useOpenAIAssistants();

  // Load OpenAI assistants on component mount
  useEffect(() => {
    loadAssistants();
  }, []);

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
        assistant: selectedAssistant,
        openAIAssistant: openAIAssistant || "default"
      });

      // Call Supabase Edge Function for AI generation
      const { data, error } = await supabase.functions.invoke("generate-checklist", {
        body: {
          prompt,
          num_questions: questionCount,
          category: selectedAssistant,
          company_id: checklistData.companyId,
          assistant_id: openAIAssistant || undefined
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
      
      // Determine the source of questions based on the response structure
      let generatedQuestions: any[] = [];
      
      if (data && data.questions && Array.isArray(data.questions)) {
        generatedQuestions = data.questions;
      } else if (data && Array.isArray(data)) {
        generatedQuestions = data;
      } else if (data && data.success && data.checklist_id) {
        // If we have a successful response with a checklist_id but no questions array
        console.log("Checklist created in database but no questions returned - using default questions");
        generatedQuestions = getDefaultQuestions(selectedAssistant, questionCount);
      } else {
        // Fallback to default questions if the response is in an unexpected format
        console.warn("Unexpected response format from AI, using default questions");
        generatedQuestions = getDefaultQuestions(selectedAssistant, questionCount);
      }
      
      // Ensure we have at least some questions
      if (!generatedQuestions || generatedQuestions.length === 0) {
        console.warn("No questions returned from AI, using defaults");
        generatedQuestions = getDefaultQuestions(selectedAssistant, questionCount);
      }
      
      // Process generated questions
      const questions: ChecklistQuestion[] = generatedQuestions.map((q: any, index: number) => {
        // Determine which group this question should belong to
        const groupIndex = index % groups.length;
        const groupId = groups[groupIndex].id;
        
        // Safely handle options of different types
        let optionsArray: string[] | undefined;
        
        if (q.options) {
          if (Array.isArray(q.options)) {
            optionsArray = q.options.map(String);
          } else if (typeof q.options === 'string') {
            optionsArray = [q.options];
          } else {
            // For multiple_choice type without options, provide defaults
            optionsArray = q.type === 'multiple_choice' ? ["Opção 1", "Opção 2"] : undefined;
          }
        } else if (q.type === 'multiple_choice' || q.responseType === 'multiple_choice') {
          optionsArray = ["Opção 1", "Opção 2"];
        }
        
        return {
          id: `new-${Date.now()}-${index}`,
          text: q.text || `Question ${index + 1}`,
          responseType: mapResponseType(q.type || 'yes_no'),
          isRequired: q.required !== undefined ? q.required : true,
          options: optionsArray,
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
        category: checklistData.category || selectedAssistant,
        status: "active" // Ensure proper status value
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
  
  // Get default questions based on the assistant type
  const getDefaultQuestions = (assistantType: AIAssistantType, count: number): any[] => {
    const questions: any[] = [];
    
    const defaultQuestions = {
      "workplace-safety": [
        { text: "Os equipamentos de proteção individual (EPI) estão sendo utilizados corretamente?", type: "yes_no" },
        { text: "Existem extintores de incêndio em todos os locais necessários?", type: "yes_no" },
        { text: "As rotas de evacuação estão devidamente sinalizadas?", type: "yes_no" },
        { text: "Os funcionários receberam treinamento adequado para emergências?", type: "yes_no" },
        { text: "As áreas de risco estão devidamente sinalizadas?", type: "yes_no" }
      ],
      "compliance": [
        { text: "Os documentos legais estão atualizados e disponíveis?", type: "yes_no" },
        { text: "Os registros obrigatórios estão sendo mantidos pelo período exigido?", type: "yes_no" },
        { text: "As licenças operacionais estão vigentes?", type: "yes_no" },
        { text: "As obrigações trabalhistas estão sendo cumpridas?", type: "yes_no" },
        { text: "Existem desvios em relação aos procedimentos internos?", type: "yes_no" }
      ],
      "quality": [
        { text: "Os equipamentos de medição estão calibrados?", type: "yes_no" },
        { text: "As amostras são coletadas conforme procedimento?", type: "yes_no" },
        { text: "O controle estatístico de processo é realizado?", type: "yes_no" },
        { text: "As não-conformidades são registradas e tratadas?", type: "yes_no" },
        { text: "Os indicadores de qualidade estão sendo monitorados?", type: "yes_no" }
      ],
      "general": [
        { text: "A documentação está atualizada e organizada?", type: "yes_no" },
        { text: "O ambiente de trabalho está limpo e organizado?", type: "yes_no" },
        { text: "Os colaboradores possuem as ferramentas necessárias?", type: "yes_no" },
        { text: "Os processos estão documentados e acessíveis?", type: "yes_no" },
        { text: "Os prazos estão sendo cumpridos?", type: "yes_no" }
      ]
    };
    
    // Get the questions for the selected type or use general
    const typeQuestions = defaultQuestions[assistantType] || defaultQuestions["general"];
    
    // Add as many questions as requested, repeating if necessary
    for (let i = 0; i < count; i++) {
      questions.push({
        ...typeQuestions[i % typeQuestions.length],
        required: true,
        allowPhoto: false,
        allowVideo: false,
        allowAudio: false
      });
    }
    
    return questions;
  };
  
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
    
    return typeMap[type?.toLowerCase()] || 'text';
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
    assistants,
    loadingAssistants,
    generateChecklist
  };
}
