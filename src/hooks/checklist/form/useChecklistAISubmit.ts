
import { useState } from "react";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";

export function useChecklistAISubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createChecklistWithAI = async (
    prompt: string,
    form: NewChecklist,
    assistantType: string = "general",
    numQuestions: number = 10
  ): Promise<string | null> => {
    try {
      setIsSubmitting(true);
      
      // Validate inputs
      if (!prompt.trim()) {
        toast.error("O prompt para o assistente é obrigatório");
        return null;
      }
      
      if (!form.title?.trim()) {
        toast.error("O título é obrigatório");
        return null;
      }
      
      // Store original prompt for history
      const promptRequest = {
        prompt: prompt.trim(),
        assistantType: assistantType || "general",
        numQuestions
      };
      
      // Create loading toast
      toast.loading("Gerando checklist com IA...", { id: "ai-generation" });
      
      try {
        // Call the edge function to generate questions with AI
        const { data: aiData, error: aiError } = await supabase.functions.invoke("generate-checklist-items", {
          body: {
            prompt: promptRequest.prompt,
            assistant: promptRequest.assistantType,
            numQuestions: promptRequest.numQuestions,
          }
        });
        
        if (aiError) {
          console.error("Error generating checklist with AI:", aiError);
          toast.error("Erro ao gerar checklist com IA", { id: "ai-generation" });
          return null;
        }
        
        if (!aiData || !Array.isArray(aiData.questions) || aiData.questions.length === 0) {
          toast.error("O assistente não conseguiu gerar perguntas. Por favor, tente um prompt diferente.", { id: "ai-generation" });
          return null;
        }
        
        // Create checklist
        const { data: checklistData, error: checklistError } = await supabase
          .from("checklists")
          .insert({
            title: form.title.trim(),
            description: form.description || `Checklist gerado por IA com base no prompt: "${promptRequest.prompt.substring(0, 100)}${promptRequest.prompt.length > 100 ? '...' : ''}"`,
            is_template: form.is_template || false,
            status_checklist: form.status_checklist || "ativo",
            category: form.category || "",
            responsible_id: form.responsible_id || null,
            company_id: form.company_id || null,
            status: form.status || "active",
            origin: "ia" // Explicitly set the origin
          })
          .select("id")
          .single();
        
        if (checklistError) {
          console.error("Error creating checklist:", checklistError);
          toast.error("Erro ao criar checklist", { id: "ai-generation" });
          return null;
        }
        
        const checklistId = checklistData.id;
        
        // Prepare questions for insertion
        const questionsToInsert = aiData.questions.map((q: any, index: number) => ({
          checklist_id: checklistId,
          pergunta: q.text.trim(),
          tipo_resposta: q.type || "sim/não",
          obrigatorio: q.required !== undefined ? q.required : true,
          ordem: index,
          permite_foto: q.allowPhoto || false,
          permite_video: q.allowVideo || false,
          permite_audio: q.allowAudio || false,
          opcoes: q.options && q.options.length > 0 ? q.options : null,
          hint: q.hint || null,
          weight: q.weight || 1,
          parent_item_id: q.parentId || null,
          condition_value: q.conditionValue || null
        }));
        
        // Insert questions
        const { error: questionsError } = await supabase
          .from("checklist_itens")
          .insert(questionsToInsert);
        
        if (questionsError) {
          console.error("Error adding questions:", questionsError);
          toast.warning("Checklist criado, mas houve um erro ao adicionar algumas perguntas", { id: "ai-generation" });
        }
        
        // Add to history
        await supabase.from("checklist_history").insert({
          checklist_id: checklistId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action: "create",
          details: `Checklist gerado por IA usando o assistente "${assistantType}" com ${aiData.questions.length} perguntas`
        });
        
        toast.success("Checklist gerado com sucesso!", { id: "ai-generation" });
        return checklistId;
      } catch (error) {
        console.error("Error in AI generation:", error);
        toast.error(`Erro na geração por IA: ${error instanceof Error ? error.message : "Erro desconhecido"}`, { id: "ai-generation" });
        return null;
      }
    } catch (error) {
      console.error("Error in createChecklistWithAI:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    createChecklistWithAI
  };
}
