
import { useCallback } from "react";
import { toast } from "sonner";

export function useLocalDraft(formData: any, setFormData: any, setDraftSaved: any) {
  const saveLocalDraft = useCallback(() => {
    try {
      localStorage.setItem('inspection_draft', JSON.stringify(formData));
      setDraftSaved(new Date());
    } catch (err) {
      console.error("Error saving local draft:", err);
    }
  }, [formData, setDraftSaved]);

  const loadLocalDraft = useCallback(() => {
    try {
      const savedData = localStorage.getItem('inspection_draft');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.scheduledDate) {
          parsedData.scheduledDate = new Date(parsedData.scheduledDate);
        }
        setFormData(parsedData);
        return true;
      }
    } catch (err) {
      console.error("Error loading local draft:", err);
    }
    return false;
  }, [setFormData]);

  const discardDraft = () => {
    localStorage.removeItem('inspection_draft');
    window.location.reload();
  };

  return { saveLocalDraft, loadLocalDraft, discardDraft };
}
