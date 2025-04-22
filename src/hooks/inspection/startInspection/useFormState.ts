
import { useState } from "react";
import { StartInspectionFormData } from "../useStartInspection";

export function useFormState(checklistId?: string) {
  const [formData, setFormData] = useState<StartInspectionFormData>({
    companyId: "",
    companyData: null,
    responsibleId: "",
    responsibleData: null,
    checklistId: checklistId || "",
    location: "",
    coordinates: null,
    notes: "",
    inspectionType: "routine",
    priority: "medium",
    scheduledDate: undefined,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const updateFormField = (field: keyof StartInspectionFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return { formData, setFormData, updateFormField, formErrors, setFormErrors };
}
