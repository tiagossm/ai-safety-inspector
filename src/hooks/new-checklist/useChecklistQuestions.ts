
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

  const handleAddQuestion = useCallback((groupId: string = "default") => {
    const newId = `new-${Date.now()}`;
    const order = questions.length > 0 
      ? Math.max(...questions.map(q => q.order)) + 1 
      : 0;

    // Ensure we have a valid group ID
    const targetGroupId = groupId || (groups.length > 0 ? groups[0].id : "default");

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
      groupId: targetGroupId,
      level: 0,
      path: newId,
      isConditional: false,
      options: []
    };
    
    setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
    toast.success("Pergunta adicionada", { duration: 3000 });
    return newId;
  }, [questions, setQuestions, enableAllMedia, groups]);

  const handleUpdateQuestion = useCallback((updated: ChecklistQuestion) => {
    console.log("Atualizando pergunta:", {
      id: updated.id,
      text: updated.text?.substring(0, 50),
      responseType: updated.responseType,
      options: updated.options
    });

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === updated.id
          ? { 
              ...updated, 
              options: updated.options ? [...updated.options] : [] 
            }
          : q
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

  return {
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    toggleAllMediaOptions,
    enableAllMedia
  };
}
