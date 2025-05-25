
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
      responseType: "sim/não",
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
    toast.success("Pergunta adicionada", { duration: 5000 });
    return newId;
  }, [questions, setQuestions, enableAllMedia]);

  const handleUpdateQuestion = useCallback((updatedQuestion: ChecklistQuestion) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    );
  }, [setQuestions]);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    setQuestions(prevQuestions => 
      prevQuestions.filter(q => q.id !== questionId)
    );
    
    if (!questionId.startsWith('new-')) {
      setDeletedQuestionIds(prev => [...prev, questionId]);
    }
    
    toast.success("Pergunta excluída", { duration: 5000 });
  }, [setQuestions, setDeletedQuestionIds]);

  const toggleAllMediaOptions = useCallback(() => {
    const newValue = !enableAllMedia;
    setEnableAllMedia(newValue);
    
    setQuestions(prevQuestions => 
      prevQuestions.map(q => ({
        ...q,
        allowsPhoto: newValue,
        allowsVideo: newValue,
        allowsAudio: newValue,
        allowsFiles: newValue
      }))
    );
    
    toast.success(
      newValue 
        ? "Todas as opções de mídia foram ativadas" 
        : "Todas as opções de mídia foram desativadas",
      { duration: 5000 }
    );
  }, [enableAllMedia, setQuestions]);

  return {
    enableAllMedia,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    toggleAllMediaOptions
  };
}
