
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Updates the status of multiple checklists at once
 */
export const updateBatchChecklistsStatus = async (
  ids: string[],
  newStatus: "active" | "inactive"
): Promise<void> => {
  try {
    const statusForDb = newStatus === "active" ? "ativo" : "inativo";
    
    const { error } = await supabase
      .from("checklists")
      .update({ status_checklist: statusForDb })
      .in("id", ids);

    if (error) {
      console.error("Error updating checklists status:", error);
      toast.error("Erro ao atualizar status dos checklists");
      return;
    }

    toast.success(`Status de ${ids.length} checklists atualizado com sucesso`);
  } catch (error) {
    console.error("Error updating checklists:", error);
    toast.error("Erro ao atualizar status dos checklists");
  }
};

export const deleteBatchChecklists = async (ids: string[]): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("checklists")
      .delete()
      .in("id", ids);

    if (error) {
      console.error("Error deleting checklists:", error);
      toast.error("Erro ao excluir checklists");
      return false;
    }

    toast.success(`${ids.length} checklists excluídos com sucesso`);
    return true;
  } catch (error) {
    console.error("Error deleting checklists:", error);
    toast.error("Erro ao excluir checklists");
    return false;
  }
};
