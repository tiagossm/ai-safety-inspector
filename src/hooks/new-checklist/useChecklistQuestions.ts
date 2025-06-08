
import { useState, useCallback } from "react";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";
import { generateUUID, sanitizeUUID } from "@/utils/uuidValidation";

export function useChecklistQuestions(
  questions: ChecklistQuestion[],
  setQuestions: React.Dispatch<React.SetStateAction<ChecklistQuestion[]>>,
  groups: ChecklistGroup[],
  deletedQuestionIds: string[],
  setDeletedQuestionIds: React.Dispatch<React.SetStateAction<string[]>>
) {
  const [enableAllMedia, setEnableAllMedia] = useState(false);
  const [pendingSubQuestions, setPendingSubQuestions] = useState<ChecklistQuestion[]>([]);

  const handleAddQuestion = useCallback((groupId: string = "default") => {
    const newId = `new-${Date.now()}`;
    const order = questions.length > 0 
      ? Math.max(...questions.map(q => q.order)) + 1 
      : 0;

    // Garantir que temos um groupId válido ou null
    let targetGroupId = sanitizeUUID(groupId);
    if (!targetGroupId && groups.length > 0) {
      targetGroupId = groups[0].id;
    }

    const newQuestion: ChecklistQuestion = {
      id: newId,
      text: "",
      responseType: "yes_no",
      isRequired: true,
      order,
      weight: 1,
      allowsPhoto: enableAllMedia,
      allowsVideo: enableAllMedia,
      allowsAudio: enableAllMedia,
      allowsFiles: enableAllMedia,
      groupId: targetGroupId || "default", // Usar "default" temporariamente apenas no estado local
      level: 0,
      path: newId,
      isConditional: false,
      options: []
    };
    
    setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
    toast.success("Pergunta adicionada", { duration: 3000 });
    return newId;
  }, [questions, setQuestions, enableAllMedia, groups]);

  const handleAddSubQuestion = useCallback((parentId: string) => {
    const parentQuestion = questions.find(q => q.id === parentId);
    if (!parentQuestion) {
      toast.error("Pergunta pai não encontrada");
      return;
    }

    // Se a pergunta pai ainda não tem UUID válido, criar subpergunta em estado pendente
    const parentHasValidId = parentQuestion.id && !parentQuestion.id.startsWith('new-');
    
    const newSubQuestionId = `new-sub-${Date.now()}`;
    const subQuestionOrder = questions.filter(q => q.parentQuestionId === parentId).length;

    const newSubQuestion: ChecklistQuestion = {
      id: newSubQuestionId,
      text: "",
      responseType: "yes_no",
      isRequired: true,
      order: subQuestionOrder,
      weight: 1,
      allowsPhoto: enableAllMedia,
      allowsVideo: enableAllMedia,
      allowsAudio: enableAllMedia,
      allowsFiles: enableAllMedia,
      groupId: parentQuestion.groupId,
      parentQuestionId: parentHasValidId ? parentId : undefined, // Não definir se pai não tem UUID válido
      level: (parentQuestion.level || 0) + 1,
      path: `${parentQuestion.path}.${newSubQuestionId}`,
      isConditional: false,
      options: []
    };

    if (!parentHasValidId) {
      // Adicionar à lista de pendentes até que o pai seja salvo
      setPendingSubQuestions(prev => [...prev, newSubQuestion]);
      toast.success("Subpergunta criada. Salve a pergunta pai para confirmar.", { duration: 5000 });
    } else {
      // Adicionar diretamente se o pai já tem UUID válido
      setQuestions(prevQuestions => [...prevQuestions, newSubQuestion]);
      toast.success("Subpergunta adicionada", { duration: 3000 });
    }

    return newSubQuestionId;
  }, [questions, setQuestions, enableAllMedia]);

  const handleUpdateQuestion = useCallback((updated: ChecklistQuestion) => {
    console.log("Atualizando pergunta:", {
      id: updated.id,
      text: updated.text?.substring(0, 50),
      responseType: updated.responseType,
      options: updated.options
    });

    // Sanitizar IDs UUID antes de atualizar
    const sanitizedQuestion = {
      ...updated,
      groupId: sanitizeUUID(updated.groupId) || "default",
      parentQuestionId: sanitizeUUID(updated.parentQuestionId),
      subChecklistId: sanitizeUUID(updated.subChecklistId),
      options: updated.options ? [...updated.options] : []
    };

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === updated.id ? sanitizedQuestion : q
      )
    );
  }, [setQuestions]);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    // Also delete any sub-questions
    const questionsToDelete = [questionId];
    const findSubQuestions = (parentId: string) => {
      questions.forEach(q => {
        if (q.parentQuestionId === parentId) {
          questionsToDelete.push(q.id);
          findSubQuestions(q.id); // Recursively find sub-sub-questions
        }
      });
    };
    findSubQuestions(questionId);

    // If they're new questions (not yet saved to DB), just remove them
    const newQuestions = questionsToDelete.filter(id => id.startsWith('new-'));
    const existingQuestions = questionsToDelete.filter(id => !id.startsWith('new-'));
    
    if (existingQuestions.length > 0) {
      setDeletedQuestionIds(prev => [...prev, ...existingQuestions]);
    }
    
    setQuestions(prevQuestions => 
      prevQuestions.filter(q => !questionsToDelete.includes(q.id))
    );
    
    // Remover também das pendentes se existir
    setPendingSubQuestions(prev => 
      prev.filter(q => !questionsToDelete.includes(q.id))
    );
    
    const deletedCount = questionsToDelete.length;
    toast.success(`${deletedCount > 1 ? `${deletedCount} perguntas removidas` : "Pergunta removida"}`, { duration: 3000 });
  }, [setQuestions, setDeletedQuestionIds, questions]);

  const toggleAllMediaOptions = useCallback((enabled: boolean) => {
    console.log("Alternando opções de mídia para:", enabled);
    
    setEnableAllMedia(enabled);
    
    // Atualizar todas as perguntas existentes com as novas configurações de mídia
    setQuestions(prevQuestions => 
      prevQuestions.map(question => ({
        ...question,
        allowsPhoto: enabled,
        allowsVideo: enabled,
        allowsAudio: enabled,
        allowsFiles: enabled
      }))
    );
    
    // Feedback melhorado
    if (enabled) {
      toast.success("Recursos de mídia ativados para todas as perguntas", { duration: 3000 });
    } else {
      toast.success("Recursos de mídia desativados para todas as perguntas", { duration: 3000 });
    }
  }, [setQuestions]);

  const linkPendingSubQuestions = useCallback((parentTempId: string, parentRealId: string) => {
    // Vincular subperguntas pendentes quando o pai receber UUID real
    const linkedSubQuestions = pendingSubQuestions
      .filter(q => q.path?.includes(parentTempId))
      .map(q => ({
        ...q,
        parentQuestionId: parentRealId,
        path: q.path?.replace(parentTempId, parentRealId)
      }));

    if (linkedSubQuestions.length > 0) {
      setQuestions(prev => [...prev, ...linkedSubQuestions]);
      setPendingSubQuestions(prev => 
        prev.filter(q => !q.path?.includes(parentTempId))
      );
      toast.success(`${linkedSubQuestions.length} subpergunta(s) vinculada(s)`, { duration: 3000 });
    }
  }, [pendingSubQuestions, setQuestions]);

  return {
    handleAddQuestion,
    handleAddSubQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    toggleAllMediaOptions,
    linkPendingSubQuestions,
    enableAllMedia,
    pendingSubQuestions
  };
}
