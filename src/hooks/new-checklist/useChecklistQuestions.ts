
import { useState, useCallback } from "react";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { toast } from "sonner";

export function useChecklistQuestions(
  questions: ChecklistQuestion[],
  setQuestions: React.Dispatch<React.SetStateAction<ChecklistQuestion[]>>,
  groups: ChecklistGroup[],
  deletedQuestionIds: string[],
  setDeletedQuestionIds: React.Dispatch<React.SetStateAction<string[]>>
) {
  const [enableAllMedia, setEnableAllMedia] = useState(false);

  const handleAddQuestion = useCallback((groupId: string) => {
    const newId = `new-${Date.now()}`;
    const order = questions.length > 0 
      ? Math.max(...questions.map(q => q.order)) + 1 
      : 0;

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
      groupId,
      level: 0,
      path: newId,
      isConditional: false,
      options: []
    };
    
    setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
    toast.success("Pergunta adicionada", { duration: 3000 });
    return newId;
  }, [questions, setQuestions, enableAllMedia]);

  function handleUpdateQuestion(updated: ChecklistQuestion) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === updated.id
          ? { ...updated, options: updated.options ? [...updated.options] : [] }
          : q
      )
    );
  }

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
    
    const deletedCount = questionsToDelete.length;
    toast.success(`${deletedCount > 1 ? `${deletedCount} perguntas removidas` : "Pergunta removida"}`, { duration: 3000 });
  }, [setQuestions, setDeletedQuestionIds, questions]);

  // Função corrigida para toggle de todas as opções de mídia
  const toggleAllMediaOptions = useCallback((enabled: boolean) => {
    console.log("toggleAllMediaOptions chamado com:", enabled);
    
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
    
    // Notificação de feedback
    if (enabled) {
      toast.success("Todos os recursos de mídia ativados para todas as perguntas", { duration: 3000 });
    } else {
      toast.success("Todos os recursos de mídia desativados para todas as perguntas", { duration: 3000 });
    }
  }, [setQuestions]);

  return {
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    toggleAllMediaOptions,
    enableAllMedia
  };
}
