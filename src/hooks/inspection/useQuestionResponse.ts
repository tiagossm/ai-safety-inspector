
import { useState } from "react";

export function useQuestionResponse(question: any, response: any, onResponseChange: (data: any) => void) {
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [actionPlanDialogOpen, setActionPlanDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState(response?.comment || "");
  const [actionPlanText, setActionPlanText] = useState(response?.actionPlan || "");
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(!!response?.actionPlan);
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [loadingSubChecklist, setLoadingSubChecklist] = useState(false);

  // Handle response value changes (yes/no, text, etc)
  const handleResponseValue = (value: string | number | boolean) => {
    onResponseChange({
      ...(response || {}),
      value
    });
  };

  // Handle saving comment
  const handleSaveComment = () => {
    onResponseChange({
      ...(response || {}),
      comment: commentText
    });
    setCommentDialogOpen(false);
    setShowCommentSection(true);
  };

  // Handle saving action plan
  const handleSaveActionPlan = () => {
    onResponseChange({
      ...(response || {}),
      actionPlan: actionPlanText
    });
    setActionPlanDialogOpen(false);
    setIsActionPlanOpen(true);
  };

  // Handle media upload completion
  const handleMediaUploaded = (mediaUrls: string[]) => {
    const currentUrls = response?.mediaUrls || [];
    const newUrls = [...currentUrls, ...mediaUrls];
    
    onResponseChange({
      ...(response || {}),
      mediaUrls: newUrls
    });
    
    setMediaDialogOpen(false);
  };

  // Handle opening subchecklist
  const handleOpenSubChecklist = (callback?: () => void) => {
    setLoadingSubChecklist(true);
    
    // Use timeout to simulate loading
    setTimeout(() => {
      setLoadingSubChecklist(false);
      if (callback) callback();
    }, 500);
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
