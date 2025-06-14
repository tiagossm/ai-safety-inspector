
import { useState, useCallback } from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { generateUUID } from "@/utils/uuidValidation";
import { useChecklistValidation } from "./useChecklistValidation";
import { toast } from "sonner";

export function useChecklistQuestions(
  initialQuestions: ChecklistQuestion[],
  setQuestions: (questions: ChecklistQuestion[]) => void,
  groups: any[],
  deletedQuestionIds: string[],
  setDeletedQuestionIds: (ids: string[]) => void
) {
  const { validateQuestion, ensureValidOptions } = useChecklistValidation();

  const handleAddQuestion = useCallback((groupId: string) => {
    const newQuestionId = generateUUID();
    const newQuestion: ChecklistQuestion = {
      id: newQuestionId,
      text: "",
      responseType: "yes_no",
      isRequired: true,
      weight: 1,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      allowsFiles: false,
      order: initialQuestions.length,
      groupId: groupId,
      options: [],
      level: 0,
      path: newQuestionId,
      isConditional: false
    };

    setQuestions([...initialQuestions, newQuestion]);
    toast.success("Nova pergunta adicionada");
  }, [initialQuestions, setQuestions]);

  const handleUpdateQuestion = useCallback((updatedQuestion: ChecklistQuestion) => {
    // Validar e corrigir opções se necessário
    if (updatedQuestion.responseType) {
      const validOptions = ensureValidOptions(updatedQuestion.responseType, updatedQuestion.options);
      if (JSON.stringify(validOptions) !== JSON.stringify(updatedQuestion.options)) {
        updatedQuestion = {
          ...updatedQuestion,
          options: validOptions
        };
      }
    }

    const updatedQuestions = initialQuestions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    
    setQuestions(updatedQuestions);
    
    // Validar a pergunta após atualização
    const errors = validateQuestion(updatedQuestion);
    if (errors.length > 0) {
      toast.error(`Atenção: ${errors[0]}`);
    }
  }, [initialQuestions, setQuestions, validateQuestion, ensureValidOptions]);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    const filteredQuestions = initialQuestions.filter(q => q.id !== questionId);
    setQuestions(filteredQuestions);
    
    // Adicionar à lista de deletados se não for uma pergunta nova
    if (!questionId.startsWith('new-')) {
      setDeletedQuestionIds([...deletedQuestionIds, questionId]);
    }
    
    toast.success("Pergunta removida");
  }, [initialQuestions, setQuestions, deletedQuestionIds, setDeletedQuestionIds]);

  const toggleAllMediaOptions = useCallback(() => {
    const allHaveMedia = initialQuestions.every(q => 
      q.allowsPhoto && q.allowsVideo && q.allowsAudio && q.allowsFiles
    );
    
    const updatedQuestions = initialQuestions.map(question => ({
      ...question,
      allowsPhoto: !allHaveMedia,
      allowsVideo: !allHaveMedia,
      allowsAudio: !allHaveMedia,
      allowsFiles: !allHaveMedia
    }));
    
    setQuestions(updatedQuestions);
    toast.success(allHaveMedia ? "Mídia desabilitada para todas as perguntas" : "Mídia habilitada para todas as perguntas");
  }, [initialQuestions, setQuestions]);

  return {
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    toggleAllMediaOptions
  };
}
