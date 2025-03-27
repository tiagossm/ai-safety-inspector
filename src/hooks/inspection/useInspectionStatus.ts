
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useInspectionStatus(inspectionId: string | undefined, handleSaveInspection: (responses: Record<string, any>, inspection: any) => Promise<any>) {
  const completeInspection = useCallback(async (responses: Record<string, any>, inspection: any) => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      await handleSaveInspection(responses, inspection);

      const { error } = await supabase
        .from("inspections")
        .update({ status: "completed" })
        .eq("id", inspectionId);

      if (error) throw error;

      return {
        ...inspection,
        status: "completed"
      };
    } catch (error: any) {
      console.error("Error completing inspection:", error);
      throw new Error(`Erro ao finalizar inspeção: ${error.message || "Erro desconhecido"}`);
    }
  }, [inspectionId, handleSaveInspection]);

  const reopenInspection = useCallback(async (inspection: any) => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      const { error } = await supabase
        .from("inspections")
        .update({ status: "in_progress" })
        .eq("id", inspectionId);

      if (error) throw error;

      return {
        ...inspection,
        status: "in_progress"
      };
    } catch (error: any) {
      console.error("Error reopening inspection:", error);
      throw new Error(`Erro ao reabrir inspeção: ${error.message || "Erro desconhecido"}`);
    }
  }, [inspectionId]);

  return {
    completeInspection,
    reopenInspection
  };
}
