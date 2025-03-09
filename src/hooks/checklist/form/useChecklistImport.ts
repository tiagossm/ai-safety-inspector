
import { toast } from "sonner";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist"; 
import { NewChecklist } from "@/types/checklist";

export function useChecklistImport() {
  const createChecklist = useCreateChecklist();

  const importFromFile = async (file: File, form: NewChecklist) => {
    if (!file) return null;
    
    try {
      console.log("Importing from file:", file.name);
      
      // Create a FormData instance
      const formData = new FormData();
      formData.append('file', file);
      
      // Add form data as JSON string
      formData.append('form', JSON.stringify(form));
      
      // Call the edge function to process the file
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-checklist-csv`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: formData
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Checklist importado com sucesso!");
        return true;
      } else {
        throw new Error(result.error || "Erro ao importar checklist");
      }
    } catch (error) {
      console.error("Error importing checklist:", error);
      toast.error("Erro ao importar checklist. Verifique o formato do arquivo.");
      return false;
    }
  };

  return {
    importFromFile
  };
}
