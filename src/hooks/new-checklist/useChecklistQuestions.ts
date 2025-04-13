
import { useCallback } from "react";
import { toast } from "sonner";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

export function useChecklistQuestions(
  questions: ChecklistQuestion[],
  setQuestions: React.Dispatch<React.SetStateAction<ChecklistQuestion[]>>,
  groups: ChecklistGroup[],
  deletedQuestionIds: string[],
  setDeletedQuestionIds: React.Dispatch<React.SetStateAction<string[]>>
) {
  const handleAddQuestion = useCallback((groupId: string) => {
    const newQuestion: ChecklistQuestion = {
      id: `new-${Date.now()}-${questions.length}`,
      text: "",
      responseType: "yes_no",
      isRequired: true,
      weight: 1,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      allowsFiles: false,
      order: questions.filter(q => q.groupId === groupId).length,
      groupId
    };
    
    setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
  }, [questions, setQuestions]);

  const handleUpdateQuestion = useCallback((updatedQuestion: ChecklistQuestion) => {
    const index = questions.findIndex(q => q.id === updatedQuestion.id);
    if (index === -1) return;
    
    setQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      newQuestions[index] = updatedQuestion;
      return newQuestions;
    });
  }, [questions, setQuestions]);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    if (questions.length <= 1) {
      toast.warning("O checklist deve ter pelo menos uma pergunta.");
      return;
    }
    
    if (!questionId.startsWith("new-")) {
      setDeletedQuestionIds(prev => [...prev, questionId]);
    }
    
    setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
  }, [questions, deletedQuestionIds, setQuestions, setDeletedQuestionIds]);

  const toggleAllMediaOptions = useCallback((enabled: boolean) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(question => ({
        ...question,
        allowsPhoto: enabled,
        allowsVideo: enabled,
        allowsAudio: enabled,
        allowsFiles: enabled
      }))
    );
  }, [setQuestions]);

  return {
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    toggleAllMediaOptions
  };
}
