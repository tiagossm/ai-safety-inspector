
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { StartInspectionFormData } from "../useStartInspection";

type SubmittingState = false | 'draft' | 'pending';

export function useInspectionSave(formData: StartInspectionFormData, validateForm: () => boolean, updateFormField: any, setSubmitting: (val: SubmittingState) => void) {
  const { user } = useAuth();
  const [draftSaved, setDraftSaved] = useState<Date | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const saveInspection = async (status: 'draft' | 'pending' = "pending") => {
    // Prevent multiple submissions
    if (hasSubmitted && status === 'pending') {
      console.log(`Preventing duplicate submission - inspection already submitted`);
      return false;
    }

    // For pending status, validate form
    if (status === "pending" && !validateForm()) {
      toast.error("Por favor, corrija os erros antes de prosseguir");
      return false;
    }

    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return false;
    }

    setSubmitting(status);

    try {
      const locationData = formData.coordinates
        ? {
          text: formData.location || "",
          latitude: formData.coordinates.latitude,
          longitude: formData.coordinates.longitude,
        }
        : { text: formData.location };

      const inspectionData = {
        checklist_id: formData.checklistId,
        company_id: formData.companyId,
        responsible_id: formData.responsibleId,
        location: formData.location,
        scheduled_date: formData.scheduledDate ? formData.scheduledDate.toISOString() : null,
        metadata: {
          ...locationData,
          notes: formData.notes,
          startedFrom: "new_start_inspection_screen",
        },
        status: status,
        inspection_type: formData.inspectionType,
        priority: formData.priority,
        cnae: formData.companyData?.cnae || null,
        user_id: user.id,
      };

      console.log(`Saving inspection with status: ${status}`);
      
      const { data, error } = await supabase
        .from("inspections")
        .insert(inspectionData)
        .select("id")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (status === 'pending') {
          setHasSubmitted(true);
          localStorage.removeItem("inspection_draft");
        }
        
        toast.success(status === "draft"
          ? "Rascunho salvo com sucesso"
          : "Inspeção iniciada com sucesso"
        );
        
        return data.id;
      }
      return false;
    } catch (err: any) {
      console.error("Error saving inspection:", err);
      toast.error(`Erro ao salvar inspeção: ${err.message}`);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const startInspection = async () => {
    if (hasSubmitted) {
      console.log("Inspection already submitted, preventing duplicate call");
      return false;
    }
    
    return await saveInspection("pending");
  };

  const saveAsDraft = async () => {
    return await saveInspection("draft");
  };

  const cancelAndGoBack = () => {
    localStorage.removeItem("inspection_draft");
    window.location.href = "/inspections";
  };

  return { draftSaved, setDraftSaved, startInspection, saveAsDraft, cancelAndGoBack };
}
