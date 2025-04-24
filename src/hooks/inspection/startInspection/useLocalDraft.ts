
import { useCallback } from "react";

export function useLocalDraft(formData: any, setFormData: any, setDraftSaved: any) {
  const saveLocalDraft = useCallback(() => {
    try {
      if (formData && Object.keys(formData).length > 0) {
        localStorage.setItem('inspection_draft', JSON.stringify(formData));
        setDraftSaved(new Date());
        console.log("Local draft saved successfully");
      }
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
        console.log("Local draft loaded successfully");
        return true;
      }
    } catch (err) {
      console.error("Error loading local draft:", err);
    }
    return false;
  }, [setFormData]);

  const discardDraft = () => {
    localStorage.removeItem('inspection_draft');
    setFormData({});
    setDraftSaved(null);
    console.log("Local draft discarded");
  };

  return { saveLocalDraft, loadLocalDraft, discardDraft };
}
