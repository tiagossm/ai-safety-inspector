
import { useCallback } from "react";
import { toast } from "sonner";
import { ChecklistQuestion } from "@/types/newChecklist";
import { validateRequiredFields } from "@/utils/errorHandling";

export function useChecklistValidation() {
  const validateChecklist = useCallback((title: string, category: string, questions: ChecklistQuestion[]) => {
    if (!validateRequiredFields({
      título: title.trim(),
      categoria: category.trim()
    })) {
      return false;
    }
    
    const validQuestions = questions.filter(q => q.text.trim());
    if (validQuestions.length === 0) {
      toast.error("Adicione pelo menos uma pergunta válida.");
      return false;
    }
    
    return true;
  }, []);

  return {
    validateChecklist
  };
}
