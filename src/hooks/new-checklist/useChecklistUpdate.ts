
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";

interface ChecklistUpdateParams extends Partial<ChecklistWithStats> { 
  id: string;
  questions?: ChecklistQuestion[];
  groups?: ChecklistGroup[];
  deletedQuestionIds?: string[];
  // Explicitly add these to match database column names
  is_template?: boolean;
  status_checklist?: string;
}

export function useChecklistUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ChecklistUpdateParams) => {
      const { id, questions, groups, deletedQuestionIds, ...updateData } = params;
      console.log(`Atualizando checklist ${id} com:`, updateData);
      
      // Fix column names to match the database
      const formattedUpdateData = {
        ...updateData,
        // Ensure we're using the correct column names for the database
        is_template: params.is_template !== undefined ? params.is_template : updateData.isTemplate,
        status_checklist: params.status_checklist || updateData.status,
        updated_at: new Date().toISOString()
      };
      
      // Remove frontend-only fields that don't exist in the database
      delete formattedUpdateData.isTemplate;
      delete formattedUpdateData.status;
      
      // Atualizar dados principais do checklist
      const { data, error } = await supabase
        .from("checklists")
        .update(formattedUpdateData)
        .eq("id", id)
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao atualizar checklist:", error);
        throw new Error(`Falha ao atualizar dados básicos: ${error.message}`);
      }
      
      // Se temos perguntas para atualizar, tratamos aqui
      if (questions && questions.length > 0) {
        console.log(`Processando ${questions.length} perguntas`);
        
        // Separar perguntas novas das existentes
        const newQuestions = questions.filter(q => q.id.startsWith('new-'));
        const existingQuestions = questions.filter(q => !q.id.startsWith('new-'));
        
        // Inserir novas perguntas
        if (newQuestions.length > 0) {
          const questionsToInsert = newQuestions.map((q, index) => {
            const groupInfo = groups?.find(g => g.id === q.groupId);
            const hint = groupInfo ? 
              JSON.stringify({
                groupId: groupInfo.id,
                groupTitle: groupInfo.title,
                groupIndex: groups.findIndex(g => g.id === groupInfo.id)
              }) : null;
            
            // Ensure options is always a string array
            const options = Array.isArray(q.options) 
              ? q.options.map(opt => String(opt)) 
              : [];
            
            return {
              checklist_id: id,
              pergunta: q.text,
              tipo_resposta: q.responseType,
              obrigatorio: q.isRequired,
              ordem: q.order || index,
              opcoes: options, // Ensure options is always a string array
              weight: q.weight || 1,
              permite_foto: q.allowsPhoto,
              permite_video: q.allowsVideo,
              permite_audio: q.allowsAudio,
              parent_item_id: q.parentQuestionId,
              condition_value: q.conditionValue,
              hint
            };
          });
          
          console.log(`Inserindo ${questionsToInsert.length} novas perguntas`);
          const { error: insertError } = await supabase
            .from("checklist_itens")
            .insert(questionsToInsert);
            
          if (insertError) {
            console.error("Erro ao inserir novas perguntas:", insertError);
            throw new Error(`Falha ao inserir novas perguntas: ${insertError.message}`);
          }
        }
        
        // Atualizar perguntas existentes
        for (const question of existingQuestions) {
          const groupInfo = groups?.find(g => g.id === question.groupId);
          const hint = groupInfo ? 
            JSON.stringify({
              groupId: groupInfo.id,
              groupTitle: groupInfo.title,
              groupIndex: groups.findIndex(g => g.id === groupInfo.id)
            }) : question.hint;
          
          // Ensure options is always a string array
          const options = Array.isArray(question.options) 
            ? question.options.map(opt => String(opt)) 
            : [];
          
          const { error: updateError } = await supabase
            .from("checklist_itens")
            .update({
              pergunta: question.text,
              tipo_resposta: question.responseType,
              obrigatorio: question.isRequired,
              ordem: question.order,
              opcoes: options, // Ensure options is always a string array
              weight: question.weight || 1,
              permite_foto: question.allowsPhoto,
              permite_video: question.allowsVideo,
              permite_audio: question.allowsAudio,
              parent_item_id: question.parentQuestionId,
              condition_value: question.conditionValue,
              hint,
              updated_at: new Date().toISOString()
            })
            .eq("id", question.id);
            
          if (updateError) {
            console.error(`Erro ao atualizar pergunta ${question.id}:`, updateError);
            throw new Error(`Falha ao atualizar pergunta: ${updateError.message}`);
          }
        }
      }
      
      // Excluir perguntas marcadas para exclusão
      if (deletedQuestionIds && deletedQuestionIds.length > 0) {
        console.log(`Excluindo ${deletedQuestionIds.length} perguntas`);
        const { error: deleteError } = await supabase
          .from("checklist_itens")
          .delete()
          .in("id", deletedQuestionIds);
          
        if (deleteError) {
          console.error("Erro ao excluir perguntas:", deleteError);
          throw new Error(`Falha ao excluir perguntas: ${deleteError.message}`);
        }
      }
      
      console.log("Checklist atualizado com sucesso:", data);
      return data;
    },
    onSuccess: (data) => {
      toast.success("Checklist atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["new-checklist", data?.id] });
    },
    onError: (error: any) => {
      console.error("Erro na mutação:", error);
      toast.error(`Erro ao atualizar checklist: ${error.message || "Erro desconhecido"}`);
    }
  });
}
