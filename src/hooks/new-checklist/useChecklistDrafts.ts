
import { useState, useEffect, useCallback } from "react";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";
import { useToast } from "@/components/ui/use-toast";

const DRAFT_STORAGE_PREFIX = "checklist_draft_";
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

interface ChecklistDraft {
  id?: string;
  title: string;
  description: string;
  category: string;
  isTemplate: boolean;
  status: "active" | "inactive";
  questions: ChecklistQuestion[];
  groups: ChecklistGroup[];
  lastSaved: number;
}

export function useChecklistDrafts(
  checklistId?: string,
  initialData?: {
    title: string;
    description: string;
    category: string;
    isTemplate: boolean;
    status: "active" | "inactive";
    questions: ChecklistQuestion[];
    groups: ChecklistGroup[];
  }
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  const draftKey = checklistId ? `${DRAFT_STORAGE_PREFIX}${checklistId}` : null;

  // Load draft from localStorage
  const loadDraft = useCallback(() => {
    if (!draftKey) return null;
    
    try {
      const draftJson = localStorage.getItem(draftKey);
      if (!draftJson) return null;
      
      const draft = JSON.parse(draftJson) as ChecklistDraft;
      setLastSaved(new Date(draft.lastSaved));
      return draft;
    } catch (error) {
      console.error("Error loading draft:", error);
      return null;
    }
  }, [draftKey]);

  // Save draft to localStorage
  const saveDraft = useCallback((data: {
    title: string;
    description: string;
    category: string;
    isTemplate: boolean;
    status: "active" | "inactive";
    questions: ChecklistQuestion[];
    groups: ChecklistGroup[];
  }) => {
    if (!draftKey) return;
    
    try {
      const now = Date.now();
      const draft: ChecklistDraft = {
        ...data,
        id: checklistId,
        lastSaved: now
      };
      
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setLastSaved(new Date(now));
      return true;
    } catch (error) {
      console.error("Error saving draft:", error);
      return false;
    }
  }, [draftKey, checklistId]);

  // Delete draft
  const deleteDraft = useCallback(() => {
    if (!draftKey) return;
    
    try {
      localStorage.removeItem(draftKey);
      setLastSaved(null);
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  }, [draftKey]);

  // Setup auto-save interval
  useEffect(() => {
    if (!draftKey || !initialData) return;
    
    const intervalId = setInterval(() => {
      if (initialData) {
        const saved = saveDraft(initialData);
        if (saved) {
          console.log("Checklist draft auto-saved:", new Date());
        }
      }
    }, AUTOSAVE_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [draftKey, initialData, saveDraft]);

  return {
    loadDraft,
    saveDraft,
    deleteDraft,
    lastSaved,
    hasDraft: !!lastSaved
  };
}
