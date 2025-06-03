
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
      groupId
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
    // If it's a new question (not yet saved to DB), just remove it
    if (questionId.startsWith('new-')) {
      setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
      toast.success("Pergunta removida", { duration: 3000 });
      return;
    }
    
    // For existing questions, mark for deletion
    setDeletedQuestionIds(prev => [...prev, questionId]);
    setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
    toast.success("Pergunta removida", { duration: 3000 });
  }, [setQuestions, setDeletedQuestionIds]);

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
