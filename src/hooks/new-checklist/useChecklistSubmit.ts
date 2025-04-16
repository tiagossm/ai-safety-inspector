import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useChecklistUpdate } from "@/hooks/new-checklist/useChecklistUpdate";
import { handleError } from "@/utils/errorHandling";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { useChecklistValidation } from "./useChecklistValidation";

const cleanHintMetadata = (hint: string | undefined): string | undefined => {
  if (!hint) return undefined;
  
  if (typeof hint === 'string' && hint.includes('{') && hint.includes('}')) {
    try {
      const parsed = JSON.parse(hint);
      if (parsed && (parsed.groupId || parsed.groupTitle || parsed.groupIndex)) {
        return "";
      }
    } catch (e) {
    }
  }
  
  return hint;
};

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
      
      const validQuestions = questions
        .filter(q => q.text.trim())
        .map(q => ({
          ...q,
          hint: cleanHintMetadata(q.hint)
        }));
      
      const dbStatus = status === "inactive" ? "inativo" : "ativo";
      
      const updatedChecklist = {
        id,
        title,
        description,
        category,
        is_template: isTemplate,
        status_checklist: dbStatus, 
        status: status
      };
      
      console.log("Submitting checklist with data:", {
        ...updatedChecklist,
        questions: validQuestions.length
      });
      
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
