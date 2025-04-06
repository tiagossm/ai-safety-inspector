
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";

export function useChecklistManualSubmit() {
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
      if (!form.title?.trim()) {
        toast.error("O título é obrigatório");
        return null;
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
        return null;
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
      
      return checklistId;
    } catch (error) {
      console.error("Error creating manual checklist:", error);
      toast.error(`Erro ao criar checklist: ${error.message || "Erro desconhecido"}`);
      return null;
    }
  };

  return {
    createManualChecklist
  };
}
