import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useChecklistUpdate } from "@/hooks/new-checklist/useChecklistUpdate";
import { handleApiError } from "@/utils/errorHandling";
import { ChecklistQuestion, ChecklistGroup } from "@/types/checklist";
import { validateChecklist } from "@/validation/checklistValidation";

/**
 * Limpa metadados de hint que possam estar em formato JSON
 * @param hint Texto de hint
 * @returns Texto de hint limpo
 */
const cleanHintMetadata = (hint: string | undefined): string | undefined => {
  if (!hint) return undefined;
  
  if (typeof hint === 'string' && hint.includes('{') && hint.includes('}')) {
    try {
      const parsed = JSON.parse(hint);
      if (parsed && (parsed.groupId || parsed.groupTitle || parsed.groupIndex)) {
        return "";
      }
    } catch (e) {
      // Se não conseguir fazer parse, retorna o hint original
    }
  }
  
  return hint;
};

/**
 * Hook para submissão de checklist
 */
export function useChecklistSubmit(
  id: string | undefined,
  title: string,
  description: string,
  category: string,
  isTemplate: boolean,
  status: "active" | "inactive",
  questions: ChecklistQuestion[],
  groups: ChecklistGroup[],
  deletedQuestionIds: string[]
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateChecklist = useChecklistUpdate();

  /**
   * Submete o checklist para o servidor
   * @returns true se o envio foi bem-sucedido, false caso contrário
   */
  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !id) return false;
    setIsSubmitting(true);
    
    try {
      // Valida o checklist
      const validationResult = validateChecklist({
        title,
        description,
        category,
        isTemplate,
        status,
        questions
      });
      
      if (!validationResult.valid) {
        setIsSubmitting(false);
        return false;
      }
      
      // Filtra e prepara as perguntas válidas
      const validQuestions = questions
        .filter(q => q.text.trim())
        .map(q => ({
          ...q,
          hint: cleanHintMetadata(q.hint),
          allowsFiles: q.allowsFiles || false // Garante que allowsFiles esteja definido
        }));
      
      // Mapeia o status para o formato do banco de dados
      const dbStatus = status === "inactive" ? "inativo" : "ativo";
      
      // Prepara os dados do checklist
      const updatedChecklist = {
        id,
        title,
        description,
        category,
        is_template: isTemplate,
        status_checklist: dbStatus, 
        status: status
      };
      
      console.log("Enviando checklist com dados:", {
        ...updatedChecklist,
        questions: validQuestions.length
      });
      
      // Envia os dados para o servidor
      await updateChecklist.mutateAsync({
        ...updatedChecklist,
        questions: validQuestions,
        groups,
        deletedQuestionIds
      });
      
      return true;
    } catch (error) {
      if (error?.message?.includes("violates check constraint") && 
          error?.message?.includes("checklists_status_checklist_check")) {
        toast.error("Erro ao salvar: O status do checklist é inválido. Por favor, selecione 'Ativo' ou 'Inativo'.", { duration: 5000 });
      } else {
        handleApiError(error, "Erro ao atualizar checklist");
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    id, isSubmitting, title, description, category, isTemplate, 
    status, questions, groups, deletedQuestionIds, 
    updateChecklist
  ]);

  return {
    isSubmitting,
    handleSubmit
  };
}
