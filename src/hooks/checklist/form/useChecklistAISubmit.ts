
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function useChecklistAISubmit() {
  const navigate = useNavigate();

  const createChecklistWithAI = async (
    aiPrompt: string,
    formData: NewChecklist,
    openAIAssistant?: string,
    numQuestions?: number
  ): Promise<string | null> => {
    try {
      const assistantParam = openAIAssistant ? { assistantId: openAIAssistant } : {};
      
      console.log("Generating checklist with AI:", {
        prompt: aiPrompt,
        checklistData: formData,
        questionCount: numQuestions || 10,
        assistantId: openAIAssistant
      });
      
      const { data, error } = await supabase.functions.invoke('generate-checklist-v2', {
        body: {
          prompt: aiPrompt,
          checklistData: formData,
          questionCount: numQuestions || 10,
          category: formData.category,
          companyId: formData.company_id,
          ...assistantParam
        }
      });

      if (error) {
        console.error("Error in AI generation:", error);
        throw new Error(`Error generating checklist: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error("AI generation failed:", data);
        throw new Error(data?.error || 'Failed to generate checklist');
      }

      console.log("Successfully generated checklist:", data);
      const { id, error: saveError } = await saveChecklistDataFromAI(data, formData);

      if (saveError) {
        throw saveError;
      }

      return id;
    } catch (error) {
      console.error('Error in AI generation:', error);
      toast.error(`Erro na geração por IA: ${error.message}`);
      return null;
    }
  };

  const saveChecklistDataFromAI = async (aiOutput: any, formData: NewChecklist) => {
    try {
      console.log("Saving AI generated data:", aiOutput);
      
      const checklistData = {
        title: aiOutput.checklistData?.title || formData.title || "Checklist sem título",
        description: aiOutput.checklistData?.description || formData.description || "Checklist gerado por IA",
        is_template: formData.is_template || false,
        status_checklist: formData.status_checklist || "ativo",
        category: formData.category || "general",
        company_id: formData.company_id || null,
        responsible_id: formData.responsible_id || null,
        status: 'active'
      };
      
      console.log("Inserting checklist:", checklistData);
      
      const { data, error } = await supabase
        .from('checklists')
        .insert(checklistData)
        .select('id')
        .single();

      if (error) {
        console.error("Error creating checklist:", error);
        throw error;
      }

      console.log("Checklist created with ID:", data.id);
      
      if (aiOutput.questions && aiOutput.questions.length > 0) {
        console.log(`Saving ${aiOutput.questions.length} questions`);
        
        const questionsToSave = aiOutput.questions.map((q: any, index: number) => ({
          checklist_id: data.id,
          pergunta: q.text,
          tipo_resposta: mapResponseType(q.responseType || "sim/não"),
          obrigatorio: q.isRequired !== false,
          ordem: index,
          permite_foto: q.allowsPhoto || false,
          permite_video: q.allowsVideo || false,
          permite_audio: q.allowsAudio || false,
          opcoes: q.options || null,
          weight: q.weight || 1
        }));

        const { error: questionsError } = await supabase
          .from('checklist_itens')
          .insert(questionsToSave);

        if (questionsError) {
          console.error('Error saving questions:', questionsError);
          toast.warning('Algumas perguntas não puderam ser salvas.');
        } else {
          console.log("Questions saved successfully");
        }
      }

      return { id: data.id, error: null };
    } catch (error) {
      console.error('Error saving AI-generated checklist:', error);
      return { id: null, error };
    }
  };

  const mapResponseType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'yes_no': 'sim/não',
      'multiple_choice': 'seleção múltipla',
      'numeric': 'numérico',
      'text': 'texto',
      'photo': 'foto',
      'signature': 'assinatura'
    };

    return typeMap[type] || 'sim/não';
  };

  return {
    createChecklistWithAI
  };
}
