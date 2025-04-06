
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";

export function useChecklistImportSubmit() {
  const importChecklist = async (
    file: File,
    form: NewChecklist
  ): Promise<string | null> => {
    try {
      if (!file) {
        toast.error("Por favor, selecione um arquivo para importar");
        return null;
      }
      
      console.log("Importing checklist from file:", file.name);
      
      const { data, error } = await supabase
        .from('checklists')
        .insert({
          title: form.title,
          description: form.description,
          is_template: form.is_template,
          status_checklist: form.status_checklist,
          category: form.category,
          company_id: form.company_id,
          responsible_id: form.responsible_id,
          status: 'active'
        })
        .select('id')
        .single();
      
      if (error) {
        console.error("Error creating checklist:", error);
        toast.error("Erro ao criar checklist");
        return null;
      }
      
      const checklistId = data.id;
      console.log("Import checklist created with ID:", checklistId);
      
      // Process the file import here if needed
      // This is just a placeholder for now as the original code didn't have file processing
      
      return checklistId;
    } catch (error) {
      console.error("Error importing checklist:", error);
      toast.error(`Erro ao importar checklist: ${error.message || "Erro desconhecido"}`);
      return null;
    }
  };

  return {
    importChecklist
  };
}
