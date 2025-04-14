
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useChecklistUpdate } from "@/hooks/new-checklist/useChecklistUpdate";
import { handleError } from "@/utils/errorHandling";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { useChecklistValidation } from "./useChecklistValidation";

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
  const { validateChecklist } = useChecklistValidation();

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !id) return false;
    setIsSubmitting(true);
    
    try {
      if (!validateChecklist(title, category, questions)) {
        setIsSubmitting(false);
        return false;
      }
      
      const validQuestions = questions.filter(q => q.text.trim());
      
      // Make sure to use is_template here since that's the actual column name in the database
      // This matches what is used in useChecklistUpdate.ts
      const updatedChecklist = {
        id,
        title,
        description,
        category,
        // Use is_template which matches the database column name
        is_template: isTemplate,
        // Use status_checklist which matches the database column name
        status_checklist: status === "inactive" ? "inactive" : "active"
      };
      
      await updateChecklist.mutateAsync({
        ...updatedChecklist,
        questions: validQuestions,
        groups,
        deletedQuestionIds
      });
      
      toast.success("Checklist atualizado com sucesso!");
      return true;
    } catch (error) {
      // Identify the specific database constraint error and show a more helpful message
      if (error?.message?.includes("violates check constraint") && 
          error?.message?.includes("checklists_status_checklist_check")) {
        toast.error("Erro ao salvar: O status do checklist é inválido. Por favor, selecione 'Ativo' ou 'Inativo'.");
      } else {
        handleError(error, "Erro ao atualizar checklist");
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    id, isSubmitting, title, description, category, isTemplate, 
    status, questions, groups, deletedQuestionIds, 
    updateChecklist, validateChecklist
  ]);

  return {
    isSubmitting,
    handleSubmit
  };
}
