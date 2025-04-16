
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
      groupId
    };
    
    setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
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
    // If it's a new question (not yet saved to DB), just remove it
    if (questionId.startsWith('new-')) {
      setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
      toast.success("Pergunta removida", { duration: 5000 });
      return;
    }
    
    // For existing questions, mark for deletion
    setDeletedQuestionIds(prev => [...prev, questionId]);
    setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
    toast.success("Pergunta removida", { duration: 5000 });
  }, [setQuestions, setDeletedQuestionIds]);

  // Add toggle all media options function
  const toggleAllMediaOptions = useCallback((enabled: boolean) => {
    setEnableAllMedia(enabled);
    
    // Update all questions to enable/disable media options
    setQuestions(prevQuestions => 
      prevQuestions.map(question => ({
        ...question,
        allowsPhoto: enabled,
        allowsVideo: enabled,
        allowsAudio: enabled
      }))
    );
  }, [setQuestions]);

  return {
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    toggleAllMediaOptions,
    enableAllMedia
  };
}
