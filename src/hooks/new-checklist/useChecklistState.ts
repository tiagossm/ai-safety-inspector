
import { useState, useCallback } from "react";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

export function useChecklistState(initialChecklist?: any) {
  const [title, setTitle] = useState(initialChecklist?.title || "");
  const [description, setDescription] = useState(initialChecklist?.description || "");
  const [category, setCategory] = useState(initialChecklist?.category || "");
  const [isTemplate, setIsTemplate] = useState(initialChecklist?.isTemplate || false);
  const [status, setStatus] = useState<"active" | "inactive">(
    initialChecklist?.status === "inactive" ? "inactive" : "active"
  );
  const [companyId, setCompanyId] = useState<string | undefined>(initialChecklist?.company_id);
  const [responsibleId, setResponsibleId] = useState<string | undefined>(initialChecklist?.responsible_id);
  const [dueDate, setDueDate] = useState<string | undefined>(initialChecklist?.due_date);
  
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [viewMode, setViewMode] = useState<"flat" | "grouped">("flat");
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enableAllMedia, setEnableAllMedia] = useState(false);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setCategory("");
    setIsTemplate(false);
    setStatus("active");
    setCompanyId(undefined);
    setResponsibleId(undefined);
    setDueDate(undefined);
    setQuestions([]);
    setGroups([]);
    setDeletedQuestionIds([]);
    setIsSubmitting(false);
    setEnableAllMedia(false);
  }, []);

  return {
    // Basic info
    title, setTitle,
    description, setDescription,
    category, setCategory,
    isTemplate, setIsTemplate,
    status, setStatus,
    companyId, setCompanyId,
    responsibleId, setResponsibleId,
    dueDate, setDueDate,
    
    // Structure
    questions, setQuestions,
    groups, setGroups,
    viewMode, setViewMode,
    
    // Management
    deletedQuestionIds, setDeletedQuestionIds,
    isSubmitting, setIsSubmitting,
    enableAllMedia, setEnableAllMedia,
    
    // Actions
    resetForm
  };
}
