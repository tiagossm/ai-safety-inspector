
import { useState } from "react";
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
  
  const safeParseResponse = (value: any) => {
    if (!value) return null;
    
    if (typeof value === 'object') return value;
    
    if (typeof value === 'string') {
      try {
        if (value.startsWith('{') || value.startsWith('[')) {
          return JSON.parse(value);
        }
        return value;
      } catch (e) {
        console.warn("Failed to parse JSON response:", e);
        return value;
      }
    }
    
    return value;
  };
  
  const handleOpenSubChecklist = (questionId: string, subChecklists: Record<string, any>) => {
    if (!subChecklists || !subChecklists[questionId]) {
      toast.error("Sub-checklist não encontrado");
      return;
    }
    
    const subChecklist = subChecklists[questionId];
    const parentResponse = responses[questionId] || {};
    
    let subChecklistResponses: Record<string, any> = {};
    
    if (parentResponse.subChecklistResponses) {
      try {
        if (typeof parentResponse.subChecklistResponses === 'object') {
          subChecklistResponses = parentResponse.subChecklistResponses;
        } else {
          const parsedResponses = safeParseResponse(parentResponse.subChecklistResponses);
          if (parsedResponses && typeof parsedResponses === 'object') {
            subChecklistResponses = parsedResponses;
          }
        }
      } catch (error) {
        console.error("Error parsing sub-checklist responses:", error);
        subChecklistResponses = {};
      }
    }
    
    setCurrentSubChecklist(subChecklist);
    setCurrentParentQuestionId(questionId);
    setSubChecklistDialogOpen(true);
  };
  
  const handleSaveSubChecklistResponses = async (responsesObj: Record<string, any>) => {
    if (!currentParentQuestionId) return;
    
    setSavingSubChecklist(true);
    
    try {
      onResponseChange(currentParentQuestionId, {
        ...(responses[currentParentQuestionId] || {}),
        subChecklistResponses: responsesObj
      });
      
      await onSaveSubChecklistResponses(currentParentQuestionId, responsesObj);
      
      toast.success("Respostas do sub-checklist salvas com sucesso");
      setSubChecklistDialogOpen(false);
    } catch (error) {
      console.error("Error saving sub-checklist responses:", error);
      toast.error("Erro ao salvar respostas do sub-checklist");
    } finally {
      setSavingSubChecklist(false);
    }
  };

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
