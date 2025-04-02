
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
      
      console.log("Generating checklist with AI:", {
        prompt: aiPrompt,
        checklistData: formData,
        questionCount: numQuestions || 10,
        assistantId: openAIAssistant
      });
      
      const { data, error } = await supabase.functions.invoke('generate-checklist', {
        body: {
          prompt: aiPrompt,
          checklistData: formData,
          questionCount: numQuestions || 10,
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

      // Format data for database
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
      
      // Prepare checklist data
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
      
      // Save checklist to database
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
      
      // Save questions
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
    if (isSubmitting) {
      console.log("Submission already in progress");
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log(`Processing ${activeTab} checklist creation`);
      
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
        console.log("Creating AI checklist with prompt:", aiPrompt);
        
        // Set a default title if empty
        const formData = { ...form };
        if (!formData.title) {
          const shortPrompt = aiPrompt.length > 40 ? 
            aiPrompt.substring(0, 40) + "..." : 
            aiPrompt;
          formData.title = `Checklist: ${shortPrompt}`;
          formData.description = `Checklist gerado por IA com base em: ${aiPrompt}`;
        }
        
        // Generate and create checklist with AI
        const checklistId = await createChecklistWithAI(aiPrompt, formData, openAIAssistant, numQuestions);
        
        if (checklistId) {
          toast.success("Checklist criado com sucesso!");
          // Navigate to the edit page
          navigate(`/new-checklists/${checklistId}`);
          return true;
        } else {
          toast.error("Falha ao gerar checklist com IA");
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
        
        console.log("Creating manual checklist:", form);
        
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
        console.log("Manual checklist created with ID:", checklistId);
        
        if (questions && questions.length > 0) {
          console.log(`Saving ${questions.length} questions for manual checklist`);
          
          const questionsToSave = questions.map((q, index) => ({
            checklist_id: checklistId,
            pergunta: q.text,
            tipo_resposta: q.type,
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
          } else {
            console.log("Questions saved successfully");
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
        
        console.log("Importing checklist from file:", file.name);
        
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
        console.log("Import checklist created with ID:", checklistId);
        
        // Parse and process CSV file
        // Note: Implement CSV parsing logic here or use an existing implementation
        // For demonstration, we'll just navigate to the checklist
        
        toast.success("Checklist criado com sucesso!");
        navigate(`/new-checklists/${checklistId}`);
        return true;
      }
      
      return false;
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
