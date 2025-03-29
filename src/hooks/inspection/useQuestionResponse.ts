
import { useState } from "react";
import { toast } from "sonner";

export function useQuestionResponse(question: any, response: any, onResponseChange: (data: any) => void) {
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [actionPlanDialogOpen, setActionPlanDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState(response?.comment || "");
  const [actionPlanText, setActionPlanText] = useState(response?.actionPlan || "");
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(!!response?.actionPlan);
  const [showCommentSection, setShowCommentSection] = useState(!!response?.comment);
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
  };

  const handleSaveActionPlan = () => {
    onResponseChange({
      ...(response || {}),
      actionPlan: actionPlanText
    });
    setActionPlanDialogOpen(false);
    setIsActionPlanOpen(true);
  };

  const handleMediaUploaded = (mediaUrls: string[]) => {
    onResponseChange({
      ...(response || {}),
      mediaUrls: [...(response?.mediaUrls || []), ...mediaUrls]
    });
  };

  const handleOpenSubChecklist = (onOpenSubChecklistCallback?: () => void) => {
    if (!question.hasSubChecklist) {
      toast.error("Esta pergunta não possui um sub-checklist associado.");
      return;
    }

    setLoadingSubChecklist(true);
    try {
      // Call the callback to open the sub-checklist dialog
      if (onOpenSubChecklistCallback) {
        onOpenSubChecklistCallback();
      }
    } catch (error) {
      console.error("Error opening sub-checklist:", error);
      toast.error("Erro ao abrir sub-checklist");
    } finally {
      setLoadingSubChecklist(false);
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
