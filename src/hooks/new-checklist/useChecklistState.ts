
import { useState } from "react";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

export function useChecklistState(initialChecklist: any) {
  const [title, setTitle] = useState(initialChecklist?.title || "");
  const [description, setDescription] = useState(initialChecklist?.description || "");
  const [category, setCategory] = useState(initialChecklist?.category || "");
  const [isTemplate, setIsTemplate] = useState(initialChecklist?.isTemplate || false);
  const [status, setStatus] = useState<"active" | "inactive">(initialChecklist?.status || "active");
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [viewMode, setViewMode] = useState<"flat" | "grouped">("flat");
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enableAllMedia, setEnableAllMedia] = useState(false);
  
  return {
    // State
    title,
    description,
    category,
    isTemplate,
    status,
    questions,
    groups,
    viewMode,
    deletedQuestionIds,
    isSubmitting,
    enableAllMedia,
    
    // Setters
    setTitle,
    setDescription,
    setCategory,
    setIsTemplate,
    setStatus,
    setQuestions,
    setGroups,
    setViewMode,
    setDeletedQuestionIds,
    setIsSubmitting,
    setEnableAllMedia
  };
}
