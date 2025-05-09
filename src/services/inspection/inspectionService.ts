
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Exclui uma inspeção pelo ID
 */
export async function deleteInspection(inspectionId: string): Promise<boolean> {
  try {
    console.log("Calling delete_inspection with ID:", inspectionId);
    
    // Inicia uma transação para excluir todos os dados relacionados
    const { data, error } = await supabase.rpc('delete_inspection', {
      inspection_id: inspectionId
    });
    
    if (error) {
      console.error("Erro ao excluir inspeção:", error);
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error("Erro ao excluir inspeção:", error);
    toast.error("Erro ao excluir inspeção", {
      description: error.message || "Ocorreu um erro ao tentar excluir a inspeção."
    });
    return false;
  }
}

/**
 * Exclui múltiplas inspeções pelos IDs
 */
export async function deleteMultipleInspections(inspectionIds: string[]): Promise<{
  success: boolean;
  successCount: number;
  errorCount: number;
}> {
  let successCount = 0;
  let errorCount = 0;
  
  if (inspectionIds.length === 0) {
    return { success: false, successCount, errorCount };
  }
  
  // Para cada inspeção, tenta excluir
  for (const id of inspectionIds) {
    try {
      const success = await deleteInspection(id);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      console.error(`Erro ao excluir inspeção ${id}:`, error);
      errorCount++;
    }
  }
  
  return {
    success: errorCount === 0,
    successCount,
    errorCount
  };
}
