
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
      
      const updatedChecklist = {
        id,
        title,
        description,
        category,
        isTemplate,
        status
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
      handleError(error, "Erro ao atualizar checklist");
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
