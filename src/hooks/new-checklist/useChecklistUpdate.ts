
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checklist, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";

// Convert UI friendly type to database type
const getDatabaseType = (type: ChecklistQuestion['responseType']): string => {
  const typeMap: Record<string, string> = {
    'yes_no': 'yes_no',
    'multiple_choice': 'multiple_choice',
    'text': 'text',
    'numeric': 'numeric',
    'photo': 'photo',
    'signature': 'signature'
  };
  
  return typeMap[type] || 'text';
};

// Fix database status mapping
const getStatusChecklist = (status: string): string => {
  // The database requires 'ativo' or 'inativo', not 'active' or 'inactive'
  return status === 'active' ? 'ativo' : 'inativo';
};

export function useChecklistUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      checklist, 
      questions, 
      groups,
      deletedQuestionIds = [] 
    }: { 
      checklist: Checklist; 
      questions?: ChecklistQuestion[];
      groups?: ChecklistGroup[];
      deletedQuestionIds?: string[];
    }) => {
      console.log("Updating checklist:", checklist.id);
      
      // Ensure we have a valid ID
      if (!checklist.id) {
        throw new Error("Checklist ID is required for updates");
      }
      
      // Fix the status value to match database constraints
      const status_checklist = getStatusChecklist(checklist.status);
      
      // Update the checklist
      const { error: updateError } = await supabase
        .from("checklists")
        .update({
          title: checklist.title,
          description: checklist.description,
          is_template: checklist.isTemplate,
          status_checklist: status_checklist, // Fixed value for database constraint
          status: checklist.status, // Keep the UI status value
          category: checklist.category,
          responsible_id: checklist.responsibleId,
          company_id: checklist.companyId,
          due_date: checklist.dueDate
        })
        .eq("id", checklist.id);
        
      if (updateError) {
        console.error("Error updating checklist:", updateError);
        throw updateError;
      }
      
      // Delete any questions that were removed
      if (deletedQuestionIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("checklist_itens")
          .delete()
          .in("id", deletedQuestionIds);
          
        if (deleteError) {
          console.error("Error deleting questions:", deleteError);
          toast.warning("Algumas perguntas não puderam ser removidas.");
        }
      }
      
      // If we have questions, update or insert them
      if (questions && questions.length > 0) {
        // Process each question - existing ones get updated, new ones get inserted
        for (const question of questions) {
          // For grouped questions, store group info in the hint field
          let questionHint = question.hint || "";
          
          if (question.groupId && groups) {
            const group = groups.find(g => g.id === question.groupId);
            if (group) {
              // Store group info as JSON in the hint field
              questionHint = JSON.stringify({
                groupId: group.id,
                groupTitle: group.title,
                groupIndex: groups.indexOf(group)
              });
            }
          }
          
          const questionData = {
            checklist_id: checklist.id,
            pergunta: question.text,
            tipo_resposta: getDatabaseType(question.responseType),
            obrigatorio: question.isRequired,
            opcoes: question.options,
            hint: questionHint,
            weight: question.weight || 1,
            parent_item_id: question.parentQuestionId,
            condition_value: question.conditionValue,
            permite_foto: question.allowsPhoto || false,
            permite_video: question.allowsVideo || false,
            permite_audio: question.allowsAudio || false,
            ordem: question.order
          };
          
          // Check if question has an ID (existing) or needs to be created
          if (question.id && question.id.startsWith("new-")) {
            // This is a new question with a temporary ID, insert it
            const { error: insertError } = await supabase
              .from("checklist_itens")
              .insert(questionData);
              
            if (insertError) {
              console.error("Error inserting new question:", insertError);
              toast.warning(`Erro ao adicionar pergunta: "${question.text}"`);
            }
          } else if (question.id) {
            // This is an existing question, update it
            const { error: updateQuestionError } = await supabase
              .from("checklist_itens")
              .update(questionData)
              .eq("id", question.id);
              
            if (updateQuestionError) {
              console.error("Error updating question:", updateQuestionError);
              toast.warning(`Erro ao atualizar pergunta: "${question.text}"`);
            }
          }
        }
      }
      
      return { id: checklist.id };
    },
    onSuccess: (result) => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["new-checklist", result.id] });
      toast.success("Checklist atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error in useChecklistUpdate:", error);
      toast.error(`Erro ao atualizar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  });
}
