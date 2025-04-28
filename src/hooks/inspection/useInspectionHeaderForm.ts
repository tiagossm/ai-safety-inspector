
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Coordinates {
  latitude?: number;
  longitude?: number;
}

export interface InspectionFormValues {
  companyId: string;
  responsibleIds: string[];
  scheduledDate: Date | null;
  location: string;
  inspectionType: string;
  priority: string;
  notes?: string;
  coordinates?: Coordinates | null;
}

export interface InspectionHeaderFormProps {
  inspectionId: string;
  inspection: any;
  company: any;
  responsible: any;
  isEditable?: boolean;
  onSave: () => void;
}

export function useInspectionHeaderForm(inspectionId: string) {
  const [updating, setUpdating] = useState(false);
  
  const updateInspectionData = async (formData: InspectionFormValues) => {
    if (!inspectionId) {
      toast.error("ID da inspeção não fornecido");
      return;
    }

    try {
      setUpdating(true);
      
      const { companyId, responsibleIds, scheduledDate, location, inspectionType, priority, notes, coordinates } = formData;
      
      // Validate required fields
      if (!companyId || responsibleIds.length === 0 || !location || !inspectionType) {
        toast.error("Por favor, preencha todos os campos obrigatórios");
        return;
      }

      // Format the data for the update
      const updateData: Record<string, any> = {
        company_id: companyId,
        responsible_id: responsibleIds[0], // For backwards compatibility
        responsible_ids: responsibleIds,
        location: location,
        scheduled_date: scheduledDate,
        inspection_type: inspectionType,
        priority: priority,
        metadata: {
          notes: notes || "",
          coordinates: coordinates || null,
          responsible_data: null,
        },
      };

      // Update inspection data
      const { error } = await supabase
        .from("inspections")
        .update(updateData)
        .eq("id", inspectionId);

      if (error) throw error;

      toast.success("Dados da inspeção atualizados com sucesso");
    } catch (error: any) {
      console.error("Error updating inspection:", error);
      toast.error(`Erro ao atualizar dados da inspeção: ${error.message}`);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const validateRequiredFields = (formData: InspectionFormValues) => {
    const required = ['companyId', 'responsibleIds', 'location', 'inspectionType'];
    const missing = [];

    if (!formData.companyId) missing.push('Empresa');
    if (!formData.responsibleIds || formData.responsibleIds.length === 0) missing.push('Responsável');
    if (!formData.location) missing.push('Localização');
    if (!formData.inspectionType) missing.push('Tipo de Inspeção');

    return {
      valid: missing.length === 0,
      missing
    };
  };

  const saveAsDraft = async (formData: InspectionFormValues) => {
    if (!inspectionId) {
      toast.error("ID da inspeção não fornecido");
      return;
    }

    try {
      setUpdating(true);
      
      // Allow save as draft without all required fields
      const { companyId, responsibleIds, scheduledDate, location, inspectionType, priority, notes, coordinates } = formData;

      // Format the data for update
      const updateData: Record<string, any> = {};
      
      if (companyId) updateData.company_id = companyId;
      if (responsibleIds && responsibleIds.length > 0) {
        updateData.responsible_id = responsibleIds[0];
        updateData.responsible_ids = responsibleIds;
      }
      if (location) updateData.location = location;
      if (scheduledDate) updateData.scheduled_date = scheduledDate;
      if (inspectionType) updateData.inspection_type = inspectionType;
      if (priority) updateData.priority = priority;
      
      // Update metadata
      updateData.metadata = {
        notes: notes || "",
        coordinates: coordinates || null
      };

      // Update inspection data
      const { error } = await supabase
        .from("inspections")
        .update(updateData)
        .eq("id", inspectionId);

      if (error) throw error;

      toast.success("Rascunho salvo com sucesso");
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast.error(`Erro ao salvar rascunho: ${error.message}`);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateInspectionData,
    validateRequiredFields,
    saveAsDraft,
    updating
  };
}
