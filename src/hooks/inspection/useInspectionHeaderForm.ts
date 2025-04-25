
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InspectionFormValues } from "@/components/inspection/execution/InspectionHeaderForm";

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
        cnae: data.cnae,
        responsible_id: data.responsibleId,
        scheduled_date: data.scheduledDate ? data.scheduledDate.toISOString() : null,
        location: data.location || null,
        inspection_type: data.inspectionType || "internal",
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

      return true;
    } catch (err: any) {
      console.error("Error updating inspection data:", err);
      setError(err.message || "Erro desconhecido ao atualizar dados da inspeção");
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [inspectionId]);

  return {
    updateInspectionData,
    updating,
    error
  };
}
