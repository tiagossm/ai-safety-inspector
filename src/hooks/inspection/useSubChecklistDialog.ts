
import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useSubChecklistDialog(
  responses: Record<string, any>,
  onResponseChange: (questionId: string, data: any) => void,
  onSaveSubChecklistResponses: (questionId: string, responses: Record<string, any>) => Promise<void>
) {
  const [subChecklistDialogOpen, setSubChecklistDialogOpen] = useState(false);
  const [currentSubChecklist, setCurrentSubChecklist] = useState<any>(null);
  const [currentParentQuestionId, setCurrentParentQuestionId] = useState<string | null>(null);
  const [savingSubChecklist, setSavingSubChecklist] = useState(false);

  const safeParseResponse = useCallback((responseData: any) => {
    if (typeof responseData === 'string') {
      try {
        return JSON.parse(responseData);
      } catch (e) {
        console.warn("Failed to parse sub-checklist responses:", e);
        return {};
      }
    }
    return responseData || {};
  }, []);

  const handleOpenSubChecklist = useCallback((questionId: string, subChecklists: Record<string, any>) => {
    const subChecklist = subChecklists[questionId];
    
    if (!subChecklist) {
      toast.error("Sub-checklist não encontrado");
      return;
    }
    
    console.log(`Opening sub-checklist for question ${questionId}`, subChecklist);
    
    setCurrentSubChecklist(subChecklist);
    setCurrentParentQuestionId(questionId);
    setSubChecklistDialogOpen(true);
  }, []);

  const handleSaveSubChecklistResponses = useCallback(async (newResponses: Record<string, any>): Promise<void> => {
    if (!currentParentQuestionId) return;
    
    try {
      setSavingSubChecklist(true);
      
      // Update parent question response with sub-checklist responses
      const currentResponse = responses[currentParentQuestionId] || {};
      
      onResponseChange(currentParentQuestionId, {
        ...currentResponse,
        subChecklistResponses: newResponses
      });
      
      // Save to backend if provided
      if (onSaveSubChecklistResponses) {
        await onSaveSubChecklistResponses(currentParentQuestionId, newResponses);
      }
      
      toast.success("Sub-checklist salvo com sucesso");
    } catch (error) {
      console.error("Error saving sub-checklist responses:", error);
      toast.error("Erro ao salvar respostas do sub-checklist");
    } finally {
      setSavingSubChecklist(false);
    }
  }, [currentParentQuestionId, responses, onResponseChange, onSaveSubChecklistResponses]);

  return {
    subChecklistDialogOpen,
    setSubChecklistDialogOpen,
    currentSubChecklist,
    currentParentQuestionId,
    savingSubChecklist,
    handleOpenSubChecklist,
    handleSaveSubChecklistResponses,
    safeParseResponse
  };
}
