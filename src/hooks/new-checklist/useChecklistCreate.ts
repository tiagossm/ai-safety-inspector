import { useState } from "react";
import { toast } from "sonner";
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { supabase } from "@/integrations/supabase/client";

interface CreateChecklistParams {
  checklist: NewChecklistPayload;
  questions: ChecklistQuestion[];
  groups: ChecklistGroup[];
}

export function useChecklistCreate() {
  const [isLoading, setIsLoading] = useState(false);

  const createChecklist = async ({ checklist, questions, groups }: CreateChecklistParams) => {
    try {
      setIsLoading(true);

      const checklistPayload = {
        title: checklist.title,
        description: checklist.description,
        is_template: checklist.is_template,
        status: checklist.status || "active",
        status_checklist: checklist.status_checklist || "ativo",
        category: checklist.category,
        company_id: checklist.company_id,
        responsible_id: checklist.responsible_id,
        origin: checklist.origin || "manual",
      };

      const { data: checklistData, error: checklistError } = await supabase
        .from('checklists')
        .insert(checklistPayload)
        .select('id')
        .single();

      if (checklistError) {
        console.error("Error creating checklist:", checklistError);
        throw checklistError;
      }

      if (questions && questions.length > 0) {
        const questionDataArray = questions.map((question, index) => ({
          checklist_id: checklistData.id,
          pergunta: question.text,
          tipo_resposta: question.responseType,
          obrigatorio: question.isRequired,
          ordem: index,
          permite_foto: question.allowsPhoto || false,
          permite_video: question.allowsVideo || false,
          permite_audio: question.allowsAudio || false,
          opcoes: question.options || null,
          weight: question.weight || 1,
          group_id: question.groupId
        }));

        const { error: questionsError } = await supabase
          .from('checklist_itens')
          .insert(questionDataArray);

        if (questionsError) {
          console.error('Error saving questions:', questionsError);
          toast.warning('Algumas perguntas não puderam ser salvas.');
        }
      }
      
      if (groups && groups.length > 0) {
        const groupDataArray = groups.map((group, index) => ({
          checklist_id: checklistData.id,
          title: group.title,
          order: index
        }));
        
        const { error: groupsError } = await supabase
          .from('checklist_groups')
          .insert(groupDataArray);
          
        if (groupsError) {
          console.error('Error saving groups:', groupsError);
          toast.warning('Alguns grupos não puderam ser salvos.');
        }
      }

      return checklistData;
    } catch (error) {
      console.error("Error submitting checklist:", error);
      toast.error(`Erro ao salvar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    mutateAsync: createChecklist
  };
}
