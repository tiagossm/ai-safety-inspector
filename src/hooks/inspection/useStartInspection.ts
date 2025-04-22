
import { useEffect, useState } from "react";
import { useFormState } from "./startInspection/useFormState";
import { useChecklistInfo } from "./startInspection/useChecklistInfo";
import { useCompanyAndResponsible } from "./startInspection/useCompanyAndResponsible";
import { useFormValidation } from "./startInspection/useFormValidation";
import { useInspectionSave } from "./startInspection/useInspectionSave";
import { useLocalDraft } from "./startInspection/useLocalDraft";
import { useLocation } from "./startInspection/useLocation";
import { useProgressAndShare } from "./startInspection/useProgressAndShare";

export type InspectionType = "internal" | "external" | "audit" | "routine";
export type InspectionPriority = "low" | "medium" | "high";
export type SubmittingState = false | 'draft' | 'pending';

export interface StartInspectionFormData {
  companyId: string;
  companyData: any | null;
  responsibleId: string;
  responsibleData: any | null;
  checklistId: string;
  location: string;
  coordinates: { latitude: number; longitude: number } | null;
  notes: string;
  inspectionType: InspectionType;
  priority: InspectionPriority;
  scheduledDate: Date | undefined;
}

export function useStartInspection(checklistId?: string) {
  // 1. Form state
  const {
    formData,
    setFormData,
    updateFormField,
    formErrors,
    setFormErrors,
  } = useFormState(checklistId);

  // 2. Company/Responsible dispatchers
  const { fetchCompanyDetails, fetchResponsibleDetails } = useCompanyAndResponsible(updateFormField, formData);

  // 3. Checklist Info and fetch logic
  const {
    checklist,
    checklistLoading,
    fetchChecklistInfo,
    setChecklist,
  } = useChecklistInfo(
    checklistId,
    (id: string) => updateFormField("companyId", id),
    (id: string) => updateFormField("responsibleId", id),
    fetchCompanyDetails,
    fetchResponsibleDetails,
  );

  // 4. Validation
  const { validateForm } = useFormValidation(formData, setFormErrors);

  // 5. Submit & Save logic
  const [submitting, setSubmitting] = useState<SubmittingState>(false);
  const { draftSaved, setDraftSaved, startInspection, saveAsDraft, cancelAndGoBack } =
    useInspectionSave(formData, validateForm, updateFormField, setSubmitting);

  // 6. Local draft
  const { saveLocalDraft, loadLocalDraft, discardDraft } = useLocalDraft(formData, setFormData, setDraftSaved);

  // 7. Location
  const { getCurrentLocation, loading } = useLocation(updateFormField);

  // 8. Progress and sharing
  const { getFormProgress, generateShareableLink } = useProgressAndShare(formData);

  // 9. Draft autosave on field change
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      if (formData.companyId || formData.location || formData.notes) {
        saveLocalDraft();
      }
    }, 30000);
    return () => clearInterval(autosaveInterval);
  }, [formData, saveLocalDraft]);

  // 10. Load draft on mount
  useEffect(() => {
    const hasDraft = loadLocalDraft();
    if (hasDraft) {
      // toast is in original code, kept as is for notification
      import("sonner").then(({ toast }) =>
        toast.info("Rascunho anterior carregado", {
          description: "Seus dados preenchidos anteriormente foram restaurados",
          action: {
            label: "Descartar",
            onClick: () => {
              discardDraft();
            },
          },
        })
      );
    }
  }, [loadLocalDraft, discardDraft]);

  // 11. Fetch checklist info on id change
  useEffect(() => {
    if (checklistId) {
      fetchChecklistInfo();
    }
  }, [checklistId, fetchChecklistInfo]);

  return {
    formData,
    updateFormField,
    loading,
    submitting,
    formErrors,
    draftSaved,
    checklist,
    checklistLoading,
    validateForm,
    startInspection,
    saveAsDraft,
    cancelAndGoBack,
    getCurrentLocation,
    getFormProgress,
    generateShareableLink,
    fetchCompanyDetails,
    fetchResponsibleDetails,
  };
}
