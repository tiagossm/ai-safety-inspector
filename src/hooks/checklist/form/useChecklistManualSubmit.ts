
import { useState } from "react";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";

export function useChecklistManualSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createManualChecklist = async (
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
    }>
  ): Promise<string | null> => {
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!form.title?.trim()) {
        toast.error("O título é obrigatório");
        return null;
      }
      
      // Create checklist with origin
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .insert({
          title: form.title.trim(),
          description: form.description || "",
          is_template: form.is_template || false,
          status_checklist: form.status_checklist || "ativo",
          category: form.category || "",
          responsible_id: form.responsible_id || null,
          company_id: form.company_id || null,
          status: form.status || "active",
          origin: "manual" // Explicitly set the origin
        })
        .select("id")
        .single();
      
      if (checklistError) {
        console.error("Error creating checklist:", checklistError);
        toast.error("Erro ao criar checklist");
        return null;
      }
      
      if (!checklistData) {
        toast.error("Erro ao criar checklist: Nenhum dado retornado");
        return null;
      }
      
      const checklistId = checklistData.id;
      
      // Only add questions that have text (filter out empty questions)
      const validQuestions = questions.filter(q => q.text.trim());
      
      if (validQuestions.length > 0) {
        // Prepare questions for insertion
        const questionsToInsert = validQuestions.map((q, index) => ({
          checklist_id: checklistId,
          pergunta: q.text.trim(),
          tipo_resposta: q.type || "sim/não",
          obrigatorio: q.required,
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
          toast.warning("Checklist criado, mas houve um erro ao adicionar algumas perguntas");
        }
      }
      
      // Add to history
      await supabase.from("checklist_history").insert({
        checklist_id: checklistId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        action: "create",
        details: "Checklist criado manualmente"
      });
      
      toast.success("Checklist criado com sucesso!");
      return checklistId;
    } catch (error) {
      console.error("Error in createManualChecklist:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    createManualChecklist
  };
}
