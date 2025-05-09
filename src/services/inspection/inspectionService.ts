
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Exclui uma inspeção pelo ID
 */
export async function deleteInspection(inspectionId: string): Promise<boolean> {
  try {
    // Primeiro, exclua todas as respostas associadas à inspeção
    const { error: responsesError } = await supabase
      .from("inspection_responses")
      .delete()
      .eq("inspection_id", inspectionId);
    
    if (responsesError) {
      console.error("Erro ao excluir respostas da inspeção:", responsesError);
      throw responsesError;
    }
    
    // Em seguida, exclua as assinaturas associadas (se houver)
    const { error: signaturesError } = await supabase
      .from("inspection_signatures")
      .delete()
      .eq("inspection_id", inspectionId);
    
    if (signaturesError) {
      console.error("Erro ao excluir assinaturas da inspeção:", signaturesError);
      // Não vamos lançar erro aqui, pois talvez não haja assinaturas
    }
    
    // Em seguida, exclua os relatórios associados (se houver)
    const { error: reportsError } = await supabase
      .from("reports")
      .delete()
      .eq("inspection_id", inspectionId);
    
    if (reportsError) {
      console.error("Erro ao excluir relatórios da inspeção:", reportsError);
      // Não vamos lançar erro aqui, pois talvez não haja relatórios
    }
    
    // Finalmente, exclua a inspeção
    const { error } = await supabase
      .from("inspections")
      .delete()
      .eq("id", inspectionId);
    
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
