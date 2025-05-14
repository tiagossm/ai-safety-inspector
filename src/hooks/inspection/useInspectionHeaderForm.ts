
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InspectionFormValues {
  companyId: string;
  responsibleIds: string[]; // Array for multiple responsible users
  scheduledDate?: Date | null;
  location: string;
  inspectionType: string;
  priority: string;
  notes?: string;
  // Updated coordinates type to handle all possible cases
  coordinates?: { 
    latitude?: number; 
    longitude?: number; 
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
      
      console.log("Updating inspection data:", data);
      
      // Format the update data
      const updateData = {
        company_id: data.companyId,
        responsible_ids: data.responsibleIds, // Using the array of responsible IDs
        scheduled_date: data.scheduledDate ? data.scheduledDate.toISOString() : null,
        location: data.location || null,
        inspection_type: data.inspectionType,
        priority: data.priority || "medium",
        metadata: {
          notes: data.notes || "",
          // Ensure coordinates are valid or set to null
          coordinates: data.coordinates && 
                      typeof data.coordinates.latitude === 'number' && 
                      typeof data.coordinates.longitude === 'number' ? 
                      data.coordinates : null,
        },
        updated_at: new Date().toISOString()
      };

      console.log("Formatted update data:", updateData);

      // Update the inspection in Supabase
      const { error: updateError, data: updatedData } = await supabase
        .from("inspections")
        .update(updateData)
        .eq("id", inspectionId)
        .select();

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw updateError;
      }

      console.log("Inspection updated successfully:", updatedData);
      toast.success("Dados da inspeção atualizados com sucesso");
      
      // If we have responsibleIds, send notifications
      if (data.responsibleIds && data.responsibleIds.length > 0) {
        try {
          // Fetch user emails based on responsibleIds
          const { data: responsibles, error: userError } = await supabase
            .from("users")
            .select("id, email, name")
            .in("id", data.responsibleIds);
            
          if (!userError && responsibles) {
            // Call the edge function to send notifications
            await supabase.functions.invoke('send-inspection-notifications', {
              body: {
                inspectionId,
                responsibles,
                inspectionData: {
                  company: data.companyId,
                  scheduledDate: data.scheduledDate,
                  location: data.location,
                  inspectionType: data.inspectionType
                }
              }
            });
          }
        } catch (notifError) {
          console.error("Error sending notifications:", notifError);
          // Don't throw here, as we want the main function to succeed even if notifications fail
        }
      }
      
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
      data.responsibleIds && data.responsibleIds.length > 0 &&
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

      console.log("Saving inspection as draft:", data);

      // Process coordinates to ensure they're valid
      let processedData = { ...data };
      
      // If coordinates exist but are incomplete or invalid, set to null
      if (processedData.coordinates &&
          (typeof processedData.coordinates.latitude !== 'number' || 
           typeof processedData.coordinates.longitude !== 'number')) {
        processedData.coordinates = null;
      }

      const updateData = {
        ...(processedData.companyId && { company_id: processedData.companyId }),
        ...(processedData.responsibleIds && { responsible_ids: processedData.responsibleIds }),
        ...(processedData.scheduledDate && { scheduled_date: processedData.scheduledDate.toISOString() }),
        ...(processedData.location !== undefined && { location: processedData.location }),
        ...(processedData.inspectionType && { inspection_type: processedData.inspectionType }),
        ...(processedData.priority && { priority: processedData.priority }),
        metadata: {
          notes: processedData.notes || "",
          coordinates: processedData.coordinates
        },
        status: 'Pendente',
        updated_at: new Date().toISOString()
      };

      console.log("Formatted draft data:", updateData);

      const { error: updateError, data: updatedData } = await supabase
        .from("inspections")
        .update(updateData)
        .eq("id", inspectionId)
        .select();

      if (updateError) {
        console.error("Supabase draft save error:", updateError);
        throw updateError;
      }

      console.log("Draft saved successfully:", updatedData);
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
