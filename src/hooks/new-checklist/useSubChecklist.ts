import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleApiError } from "@/utils/errorHandling";
import { ChecklistQuestion } from "@/types/checklist";

/**
 * Hook para gerenciar subchecklist
 * @param parentQuestionId ID da pergunta pai
 */
export function useSubChecklist(parentQuestionId: string) {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subChecklistId, setSubChecklistId] = useState<string | null>(null);

  /**
   * Busca subchecklist existente
   * @param questionId ID da pergunta
   */
  const fetchSubChecklist = useCallback(async (questionId: string) => {
    if (!questionId) return null;
    
    setIsLoading(true);
    try {
      // Busca a pergunta para verificar se tem subchecklist
      const { data: questionData, error: questionError } = await supabase
        .from("checklist_itens")
        .select("has_subchecklist, sub_checklist_id")
        .eq("id", questionId)
        .single();

      if (questionError) throw questionError;

      if (questionData?.has_subchecklist && questionData?.sub_checklist_id) {
        setSubChecklistId(questionData.sub_checklist_id);
        return questionData.sub_checklist_id;
      }
      
      return null;
    } catch (error) {
      handleApiError(error, "Erro ao buscar subchecklist");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cria um novo subchecklist
   * @param title Título do subchecklist
   * @param parentQuestion Pergunta pai
   */
  const createSubChecklist = useCallback(async (
    title: string,
    parentQuestion: ChecklistQuestion
  ) => {
    if (!parentQuestionId) {
      toast.error("ID da pergunta pai é necessário para criar subchecklist");
      return null;
    }

    setIsCreating(true);
    try {
      // Cria o subchecklist
      const { data: checklistData, error: checklistError } = await supabase
        .from("checklists")
        .insert({
          title: title || `Subchecklist para ${parentQuestion.text.substring(0, 30)}...`,
          description: `Subchecklist criado para a pergunta: ${parentQuestion.text}`,
          is_template: false,
          status_checklist: "ativo",
          is_sub_checklist: true,
          category: "subchecklist",
          origin: "manual"
        })
        .select("id")
        .single();

      if (checklistError) throw checklistError;

      const newSubChecklistId = checklistData.id;
      
      // Atualiza a pergunta pai para referenciar o subchecklist
      const { error: updateError } = await supabase
        .from("checklist_itens")
        .update({
          has_subchecklist: true,
          sub_checklist_id: newSubChecklistId
        })
        .eq("id", parentQuestionId);

      if (updateError) throw updateError;

      setSubChecklistId(newSubChecklistId);
      toast.success("Subchecklist criado com sucesso");
      return newSubChecklistId;
    } catch (error) {
      handleApiError(error, "Erro ao criar subchecklist");
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [parentQuestionId]);

  /**
   * Remove a associação com subchecklist
   */
  const removeSubChecklist = useCallback(async () => {
    if (!parentQuestionId) {
      toast.error("ID da pergunta pai é necessário para remover subchecklist");
      return false;
    }

    try {
      // Atualiza a pergunta pai para remover a referência ao subchecklist
      const { error: updateError } = await supabase
        .from("checklist_itens")
        .update({
          has_subchecklist: false,
          sub_checklist_id: null
        })
        .eq("id", parentQuestionId);

      if (updateError) throw updateError;

      // Não exclui o subchecklist, apenas remove a associação
      setSubChecklistId(null);
      toast.success("Associação com subchecklist removida");
      return true;
    } catch (error) {
      handleApiError(error, "Erro ao remover subchecklist");
      return false;
    }
  }, [parentQuestionId]);

  return {
    isCreating,
    isLoading,
    subChecklistId,
    fetchSubChecklist,
    createSubChecklist,
    removeSubChecklist
  };
}

