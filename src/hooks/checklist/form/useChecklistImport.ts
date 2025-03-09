
import { toast } from "sonner";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist"; 
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";

/**
 * Validates if the file is in correct format (CSV, XLS, XLSX)
 * @param file File to validate
 * @returns Object with validation result and message
 */
const validateFileFormat = (file: File): { valid: boolean; message?: string } => {
  if (!file) {
    return { valid: false, message: 'Nenhum arquivo selecionado' };
  }
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!['csv', 'xls', 'xlsx'].includes(fileExtension || '')) {
    return { 
      valid: false, 
      message: 'Formato de arquivo inválido. Apenas arquivos CSV, XLS e XLSX são suportados.' 
    };
  }
  
  return { valid: true };
};

export function useChecklistImport() {
  const createChecklist = useCreateChecklist();

  const getTemplateFileUrl = () => {
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/templates/checklist_import_template.xlsx`;
  };

  const importFromFile = async (file: File, form: NewChecklist) => {
    // Validate file format
    const validation = validateFileFormat(file);
    if (!validation.valid) {
      toast.error(validation.message || "Arquivo inválido");
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
      
      // Get the current session JWT
      const { data: sessionData } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;
      
      if (!jwt) {
        throw new Error("Você precisa estar autenticado para importar um checklist");
      }
      
      // Call the edge function to process the file
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-checklist-csv`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
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
        return result;
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
    importFromFile,
    getTemplateFileUrl
  };
}
