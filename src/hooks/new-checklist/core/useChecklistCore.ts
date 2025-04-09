
import { useState } from 'react';
import { ChecklistWithStats } from '@/types/newChecklist';

/**
 * Core hook providing basic checklist state management
 */
export function useChecklistCore(initialChecklist?: ChecklistWithStats | null) {
  const [title, setTitle] = useState(initialChecklist?.title || "");
  const [description, setDescription] = useState(initialChecklist?.description || "");
  const [category, setCategory] = useState(initialChecklist?.category || "");
  const [isTemplate, setIsTemplate] = useState(initialChecklist?.isTemplate || false);
  const [status, setStatus] = useState<"active" | "inactive">(initialChecklist?.status || "active");

  return {
    title,
    description,
    category,
    isTemplate,
    status,
    setTitle,
    setDescription,
    setCategory,
    setIsTemplate,
    setStatus,
  };
}
