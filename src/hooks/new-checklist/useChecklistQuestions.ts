
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
  const handleAddQuestion = useCallback((groupId: string) => {
    if (!groupId && groups.length === 0) {
      toast.error("É preciso criar pelo menos um grupo antes de adicionar perguntas");
      return;
    }
    
    const targetGroupId = groupId || groups[0].id;
    
    // Find the highest order in this group
    const groupQuestions = questions.filter(q => q.groupId === targetGroupId);
    const highestOrder = groupQuestions.length > 0 
      ? Math.max(...groupQuestions.map(q => q.order))
      : -1;
    
    const newQuestion: ChecklistQuestion = {
      id: `new-${Date.now()}`,
      text: "",
      responseType: "yes_no",
      isRequired: true,
      options: [],
      weight: 1,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      allowsFiles: false,
      order: highestOrder + 1,
      groupId: targetGroupId,
      hint: "" // Ensuring hint is empty by default
    };
    
    setQuestions(prev => [...prev, newQuestion]);
    toast.success("Nova pergunta adicionada");
  }, [questions, setQuestions, groups]);

  const handleUpdateQuestion = useCallback((updatedQuestion: ChecklistQuestion) => {
    setQuestions(prev => prev.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    ));
  }, [setQuestions]);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    // If this is a new question (not yet in the database), just remove it
    if (questionId.startsWith('new-')) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      toast.success("Pergunta removida");
      return;
    }
    
    // For existing questions, mark for deletion
    setDeletedQuestionIds(prev => [...prev, questionId]);
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    toast.success("Pergunta marcada para exclusão");
  }, [setQuestions, setDeletedQuestionIds]);

  const toggleAllMediaOptions = useCallback((enabled = true) => {
    setQuestions(prev => prev.map(question => ({
      ...question,
      allowsPhoto: enabled,
      allowsVideo: enabled,
      allowsAudio: enabled,
      allowsFiles: enabled
    })));
    
    toast.success(enabled 
      ? "Opções de mídia ativadas para todas as perguntas" 
      : "Opções de mídia desativadas para todas as perguntas"
    );
  }, [setQuestions]);

  return {
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    toggleAllMediaOptions
  };
}
