import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InspectionFormValues {
  companyId: string;
  responsibleId: string;
  scheduledDate?: Date | null;
  location: string;
  inspectionType: string;
  priority: string;
  notes?: string;
  coordinates?: { 
    latitude: number; 
    longitude: number; 
  } | null;
}

export interface InspectionHeaderFormProps {
  inspectionId: string;
  inspection: any;
  company: any;
  responsible: any;
  isEditable?: boolean;
  onSave: () => void;
}

export function useInspectionHeaderForm(inspectionId: string | undefined) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateInspectionData = useCallback(async (data: InspectionFormValues) => {
    if (!inspectionId) {
      throw new Error("ID da inspeção não fornecido");
    }

    try {
      setUpdating(true);
      setError(null);
      
      // Format the update data
      const updateData = {
        company_id: data.companyId,
        responsible_id: data.responsibleId,
        scheduled_date: data.scheduledDate ? data.scheduledDate.toISOString() : null,
        location: data.location || null,
        inspection_type: data.inspectionType,
        priority: data.priority || "medium",
        metadata: {
          notes: data.notes || "",
          coordinates: data.coordinates || null,
        },
        updated_at: new Date().toISOString()
      };

      // Update the inspection in Supabase
      const { error: updateError } = await supabase
        .from("inspections")
        .update(updateData)
        .eq("id", inspectionId);

      if (updateError) throw updateError;

      toast.success("Dados da inspeção atualizados com sucesso");
      return true;
    } catch (err: any) {
      console.error("Error updating inspection data:", err);
      const errorMessage = err.message || "Erro desconhecido ao atualizar dados da inspeção";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [inspectionId]);

  const validateRequiredFields = useCallback((data: InspectionFormValues): boolean => {
    return !!(
      data.companyId &&
      data.responsibleId &&
      data.location &&
      data.inspectionType
    );
  }, []);

  const saveAsDraft = useCallback(async (data: Partial<InspectionFormValues>) => {
    if (!inspectionId) {
      throw new Error("ID da inspeção não fornecido");
    }

    try {
      setUpdating(true);
      setError(null);

      const updateData = {
        ...data,
        status: 'Pendente',
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from("inspections")
        .update(updateData)
        .eq("id", inspectionId);

      if (updateError) throw updateError;

      toast.success("Rascunho salvo com sucesso");
      return true;
    } catch (err: any) {
      console.error("Error saving draft:", err);
      const errorMessage = err.message || "Erro ao salvar rascunho";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [inspectionId]);

  return {
    updateInspectionData,
    validateRequiredFields,
    saveAsDraft,
    updating,
    error
  };
}
