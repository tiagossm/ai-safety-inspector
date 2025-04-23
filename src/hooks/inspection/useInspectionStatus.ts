
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Interface para inspeção
export interface Inspection {
  id: string;
  status: string;
  [key: string]: any;
}

// Interface para funções de hook
export interface InspectionStatusHook {
  completeInspection: (inspection: Inspection) => Promise<void>;
  reopenInspection: (inspection: Inspection) => Promise<void>;
}

export function useInspectionStatus(inspectionId: string | undefined): InspectionStatusHook {
  // Completar inspeção - função simplificada sem acoplamento
  const completeInspection = useCallback(async (inspection: Inspection): Promise<void> => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      const { error } = await supabase
        .from("inspections")
        .update({ status: "completed" })
        .eq("id", inspectionId);

      if (error) throw error;
    } catch (error: any) {
      console.error("Error completing inspection:", error);
      throw new Error(`Erro ao finalizar inspeção: ${error.message || "Erro desconhecido"}`);
    }
  }, [inspectionId]);

  // Reabrir inspeção
  const reopenInspection = useCallback(async (inspection: Inspection): Promise<void> => {
    try {
      if (!inspectionId) throw new Error("ID da inspeção não fornecido");

      const { error } = await supabase
        .from("inspections")
        .update({ status: "in_progress" })
        .eq("id", inspectionId);

      if (error) throw error;
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
