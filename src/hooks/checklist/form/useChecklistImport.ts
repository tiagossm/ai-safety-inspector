
import { toast } from "sonner";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist"; 
import { NewChecklist } from "@/types/checklist";

export function useChecklistImport() {
  const createChecklist = useCreateChecklist();

  const importFromFile = async (file: File, form: NewChecklist) => {
    if (!file) {
      toast.error("Nenhum arquivo selecionado");
      return false;
    }
    
    try {
      console.log("Importing from file:", file.name);
      
      // Create a FormData instance
      const formData = new FormData();
      formData.append('file', file);
      
      // Add form data as JSON string
      formData.append('form', JSON.stringify(form));
      
      console.log("Calling Edge Function to process CSV");
      
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
      
      if (!response.ok) {
        console.error("Edge function returned error status:", response.status);
        const errorText = await response.text();
        throw new Error(`Erro na importação (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Edge function result:", result);
      
      if (result.success) {
        toast.success(`Checklist importado com sucesso! ${result.processed_items || 0} itens processados.`);
        return true;
      } else {
        throw new Error(result.error || "Erro ao importar checklist");
      }
    } catch (error) {
      console.error("Error importing checklist:", error);
      toast.error(`Erro ao importar checklist. ${error instanceof Error ? error.message : 'Verifique o formato do arquivo.'}`);
      return false;
    }
  };

  return {
    importFromFile
  };
}
