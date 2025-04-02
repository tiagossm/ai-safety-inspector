import { useState } from "react";
import { NewChecklist } from "@/types/checklist";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UseChecklistSubmitResult {
  isSubmitting: boolean;
  handleSubmit: (
    e: React.FormEvent,
    activeTab: string,
    form: NewChecklist,
    questions: Array<{
      text: string;
      type: string;
      required: boolean;
      allowPhoto: boolean;
      allowVideo: boolean;
      allowAudio: boolean;
      options?: string[];
      hint?: string;
      weight?: number;
      parentId?: string;
      conditionValue?: string;
    }>,
    file: File | null,
    aiPrompt: string,
    openAIAssistant?: string,
    numQuestions?: number
  ) => Promise<boolean>;
}

export function useChecklistSubmit(): UseChecklistSubmitResult {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const createChecklistWithAI = async (
    aiPrompt: string,
    formData: NewChecklist,
    openAIAssistant?: string,
    numQuestions?: number
  ): Promise<string | null> => {
    try {
      // Use the OpenAI assistant if provided
      const assistantParam = openAIAssistant ? { assistantId: openAIAssistant } : {};
      
      const { data, error } = await supabase.functions.invoke('generate-checklist', {
        body: {
          prompt: aiPrompt,
          checklistData: formData,
          questionCount: numQuestions || 10,
          ...assistantParam
        }
      });

      if (error) {
        throw new Error(`Error generating checklist: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to generate checklist');
      }

      // Format data for database
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
      // Save checklist to database
      const { data, error } = await supabase
        .from('checklists')
        .insert({
          title: aiOutput.checklistData?.title || formData.title,
          description: aiOutput.checklistData?.description || formData.description,
          is_template: formData.is_template,
          status_checklist: formData.status_checklist,
          category: formData.category,
          company_id: formData.company_id,
          responsible_id: formData.responsible_id,
          status: 'active'
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      // Save questions
      if (aiOutput.questions && aiOutput.questions.length > 0) {
        const questionsToSave = aiOutput.questions.map((q: any, index: number) => ({
          checklist_id: data.id,
          pergunta: q.text,
          tipo_resposta: mapResponseType(q.responseType),
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

  const handleSubmit = async (
    e: React.FormEvent,
    activeTab: string,
    form: NewChecklist,
    questions: Array<{
      text: string;
      type: string;
      required: boolean;
      allowPhoto: boolean;
      allowVideo: boolean;
      allowAudio: boolean;
      options?: string[];
      hint?: string;
      weight?: number;
      parentId?: string;
      conditionValue?: string;
    }>,
    file: File | null,
    aiPrompt: string,
    openAIAssistant?: string,
    numQuestions?: number
  ): Promise<boolean> => {
    e.preventDefault();
    if (isSubmitting) return false;
    
    try {
      setIsSubmitting(true);
      
      // Validate based on active tab
      if (activeTab === "manual" && !form.title?.trim()) {
        toast.error("O título é obrigatório");
        return false;
      } else if (activeTab === "import" && !file) {
        toast.error("Por favor, selecione um arquivo para importar");
        return false;
      } else if (activeTab === "ai" && !aiPrompt?.trim()) {
        toast.error("Por favor, forneça um prompt para gerar o checklist");
        return false;
      }
      
      // Process based on the active tab
      if (activeTab === "ai") {
        // Generate and create checklist with AI
        const checklistId = await createChecklistWithAI(aiPrompt, form, openAIAssistant, numQuestions);
        
        if (checklistId) {
          toast.success("Checklist criado com sucesso!");
          // Navigate to the edit page
          navigate(`/new-checklists/${checklistId}`);
          return true;
        } else {
          return false;
        }
      }
      
      // For manual creation, import, or other methods...
      // Manual checklist creation
      if (activeTab === "manual") {
        if (!form.title?.trim()) {
          toast.error("O título é obrigatório");
          return false;
        }
        
        const { data, error } = await supabase
          .from('checklists')
          .insert({
            title: form.title,
            description: form.description,
            is_template: form.is_template,
            status_checklist: form.status_checklist,
            category: form.category,
            company_id: form.company_id,
            responsible_id: form.responsible_id,
            status: 'active'
          })
          .select('id')
          .single();
        
        if (error) {
          console.error("Error creating checklist:", error);
          toast.error("Erro ao criar checklist");
          return false;
        }
        
        const checklistId = data.id;
        
        if (questions && questions.length > 0) {
          const questionsToSave = questions.map((q, index) => ({
            checklist_id: checklistId,
            pergunta: q.text,
            tipo_resposta: mapResponseType(q.type),
            obrigatorio: q.required,
            ordem: index,
            permite_foto: q.allowPhoto || false,
            permite_video: q.allowVideo || false,
            permite_audio: q.allowAudio || false,
            opcoes: q.options || null,
            weight: q.weight || 1
          }));
          
          const { error: questionsError } = await supabase
            .from('checklist_itens')
            .insert(questionsToSave);
          
          if (questionsError) {
            console.error("Error saving questions:", questionsError);
            toast.warning("Algumas perguntas não puderam ser salvas.");
          }
        }
        
        toast.success("Checklist criado com sucesso!");
        navigate(`/new-checklists/${checklistId}`);
        return true;
      }
      
      // Import checklist from CSV
      if (activeTab === "import") {
        if (!file) {
          toast.error("Por favor, selecione um arquivo para importar");
          return false;
        }
        
        const { data, error } = await supabase
          .from('checklists')
          .insert({
            title: form.title,
            description: form.description,
            is_template: form.is_template,
            status_checklist: form.status_checklist,
            category: form.category,
            company_id: form.company_id,
            responsible_id: form.responsible_id,
            status: 'active'
          })
          .select('id')
          .single();
        
        if (error) {
          console.error("Error creating checklist:", error);
          toast.error("Erro ao criar checklist");
          return false;
        }
        
        const checklistId = data.id;
        
        // CSV data is already processed in the component, so just save it
        if (questions && questions.length > 0) {
          const questionsToSave = questions.map((q, index) => ({
            checklist_id: checklistId,
            pergunta: q.text,
            tipo_resposta: mapResponseType(q.type),
            obrigatorio: q.required,
            ordem: index,
            permite_foto: q.allowPhoto || false,
            permite_video: q.allowVideo || false,
            permite_audio: q.allowAudio || false,
            opcoes: q.options || null,
            weight: q.weight || 1
          }));
          
          const { error: questionsError } = await supabase
            .from('checklist_itens')
            .insert(questionsToSave);
          
          if (questionsError) {
            console.error("Error saving questions:", questionsError);
            toast.warning("Algumas perguntas não puderam ser salvas.");
          }
        }
        
        toast.success("Checklist criado com sucesso!");
        navigate(`/new-checklists/${checklistId}`);
        return true;
      }
      
      return true;
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(`Erro ao criar checklist: ${error.message || "Erro desconhecido"}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
}
