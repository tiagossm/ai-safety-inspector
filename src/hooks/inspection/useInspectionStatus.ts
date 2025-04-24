
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useInspectionStatus(inspectionId: string | undefined) {
  // Mark inspection as completed
  const completeInspection = useCallback(async (inspection: any) => {
    if (!inspectionId) {
      toast.error("ID da inspeção não fornecido");
      return inspection;
    }

    try {
      const { data, error } = await supabase
        .from("inspections")
        .update({ status: "completed" })
        .eq("id", inspectionId)
        .select()
        .single();

      if (error) throw error;

      toast.success("Inspeção finalizada com sucesso");
      return data;
    } catch (error: any) {
      console.error("Error completing inspection:", error);
      toast.error(`Erro ao finalizar inspeção: ${error.message}`);
      return inspection;
    }
  }, [inspectionId]);

  // Reopen a completed inspection
  const reopenInspection = useCallback(async (inspection: any) => {
    if (!inspectionId) {
      toast.error("ID da inspeção não fornecido");
      return inspection;
    }

    try {
      const { data, error } = await supabase
        .from("inspections")
        .update({ status: "in_progress" })
        .eq("id", inspectionId)
        .select()
        .single();

      if (error) throw error;

      toast.success("Inspeção reaberta com sucesso");
      return data;
    } catch (error: any) {
      console.error("Error reopening inspection:", error);
      toast.error(`Erro ao reabrir inspeção: ${error.message}`);
      return inspection;
    }
  }, [inspectionId]);

  return {
    completeInspection,
    reopenInspection
  };
}
