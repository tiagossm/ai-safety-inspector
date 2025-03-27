
import { useState } from "react";
import { toast } from "sonner";

export function useQuestionResponse(question: any, response: any, onResponseChange: (data: any) => void) {
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [actionPlanDialogOpen, setActionPlanDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState(response?.comment || "");
  const [actionPlanText, setActionPlanText] = useState(response?.actionPlan || "");
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [loadingSubChecklist, setLoadingSubChecklist] = useState(false);
  
  const handleResponseValue = (value: any) => {
    onResponseChange({
      ...(response || {}),
      value
    });
  };
  
  const handleSaveComment = () => {
    onResponseChange({
      ...(response || {}),
      comment: commentText
    });
    setCommentDialogOpen(false);
    toast.success("Comentário salvo");
  };
  
  const handleSaveActionPlan = () => {
    onResponseChange({
      ...(response || {}),
      actionPlan: actionPlanText
    });
    setActionPlanDialogOpen(false);
    toast.success("Plano de ação salvo");
  };
  
  const handleMediaUploaded = (mediaData: any) => {
    const mediaUrls = response?.mediaUrls || [];
    
    onResponseChange({
      ...(response || {}),
      mediaUrls: [...mediaUrls, mediaData.url]
    });
    
    toast.success("Mídia adicionada com sucesso");
    setMediaDialogOpen(false);
  };
  
  const handleOpenSubChecklist = (onOpenSubChecklist?: () => void) => {
    if (onOpenSubChecklist) {
      setLoadingSubChecklist(true);
      try {
        onOpenSubChecklist();
      } catch (error) {
        console.error("Error opening sub-checklist:", error);
        toast.error("Falha ao abrir sub-checklist");
      } finally {
        setLoadingSubChecklist(false);
      }
    } else if (question.subChecklistId) {
      toast.info("Funcionalidade de sub-checklist em desenvolvimento");
    }
  };

  return {
    commentDialogOpen,
    setCommentDialogOpen,
    actionPlanDialogOpen,
    setActionPlanDialogOpen,
    mediaDialogOpen,
    setMediaDialogOpen,
    commentText,
    setCommentText,
    actionPlanText,
    setActionPlanText,
    isActionPlanOpen,
    setIsActionPlanOpen,
    showCommentSection,
    setShowCommentSection,
    loadingSubChecklist,
    handleResponseValue,
    handleSaveComment,
    handleSaveActionPlan,
    handleMediaUploaded,
    handleOpenSubChecklist
  };
}
