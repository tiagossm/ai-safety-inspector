import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useChecklistUpdate } from "@/hooks/new-checklist/useChecklistUpdate";
import { handleError } from "@/utils/errorHandling";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { useChecklistValidation } from "./useChecklistValidation";
import { validateChecklistPayload, sanitizeUUID } from "@/utils/uuidValidation";

const cleanHintMetadata = (hint: string | undefined): string | undefined => {
  if (!hint) return undefined;
  
  if (typeof hint === 'string' && hint.includes('{') && hint.includes('}')) {
    try {
      const parsed = JSON.parse(hint);
      if (parsed && (parsed.groupId || parsed.groupTitle || parsed.groupIndex)) {
        return "";
      }
    } catch (e) {
      // Ignorar erros de parsing
    }
  }
  
  return hint;
};

const sanitizeQuestionUUIDs = (question: ChecklistQuestion): ChecklistQuestion => {
  return {
    ...question,
    hint: cleanHintMetadata(question.hint),
    allowsFiles: question.allowsFiles || false,
    groupId: sanitizeUUID(question.groupId),
    parentQuestionId: sanitizeUUID(question.parentQuestionId),
    subChecklistId: sanitizeUUID(question.subChecklistId)
  };
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
      // Correção aqui: validateChecklist espera apenas questions!
      if (!validateChecklist(questions)) {
        setIsSubmitting(false);
        return false;
      }
      
      // Filtrar e sanitizar perguntas válidas
      const validQuestions = questions
        .filter(q => q.text.trim())
        .map(sanitizeQuestionUUIDs);
      
      // Os grupos agora devem ser válidos a partir do contexto, não é mais necessário sanitizar aqui.
      const sanitizedGroups = groups;
      
      const dbStatus = status === "inactive" ? "inativo" : "ativo";
      
      const updatedChecklist = {
        id: sanitizeUUID(id) || id,
        title,
        description,
        category,
        is_template: isTemplate,
        status_checklist: dbStatus, 
        status: status
      };
      
      // Validar payload antes de enviar
      const payload = {
        ...updatedChecklist,
        questions: validQuestions,
        groups: sanitizedGroups,
        deletedQuestionIds: deletedQuestionIds.filter(id => sanitizeUUID(id))
      };
      
      const validation = validateChecklistPayload(payload);
      if (!validation.isValid) {
        toast.error(`Erro de validação: ${validation.errors.join(', ')}`, { duration: 5000 });
        setIsSubmitting(false);
        return false;
      }
      
      console.log("Submitting checklist with validated data:", {
        ...updatedChecklist,
        questions: validQuestions.length,
        validation: 'passed'
      });
      
      await updateChecklist.mutateAsync(payload);
      
      return true;
    } catch (error: any) {
      if (error?.message?.includes("violates check constraint") && 
          error?.message?.includes("checklists_status_checklist_check")) {
        toast.error("Erro ao salvar: O status do checklist é inválido. Por favor, selecione 'Ativo' ou 'Inativo'.", { duration: 5000 });
      } else if (error?.message?.includes("invalid input syntax for type uuid")) {
        toast.error("Erro ao salvar: UUID inválido detectado. Verifique os dados e tente novamente.", { duration: 5000 });
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
