
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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const jwt = sessionData?.session?.access_token;
      
      if (sessionError || !jwt) {
        console.error("Session error:", sessionError);
        throw new Error("Você precisa estar autenticado para importar um checklist");
      }
      
      console.log("Authentication token acquired, proceeding with request");
      
      // Use try/catch to handle potential errors from the function invocation
      try {
        const { data, error } = await supabase.functions.invoke('process-checklist-csv', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            // Important: Do NOT set Content-Type when using FormData
          },
          body: formData
        });
        
        if (error) {
          console.error("Edge function returned error:", error);
          throw new Error(`Erro na importação: ${error.message || 'Falha desconhecida'}`);
        }
        
        console.log("Edge function result:", data);
        
        if (data?.success) {
          toast.success(`Checklist importado com sucesso! ${data.processed_items || 0} itens processados.`);
          return data;
        } else {
          throw new Error(data?.error || "Erro ao importar checklist");
        }
      } catch (invocationError) {
        console.error("Function invocation error:", invocationError);
        throw new Error(`Erro ao processar arquivo: ${invocationError.message}`);
      }
    } catch (error) {
      console.error("Error importing checklist:", error);
      toast.error(`Erro ao importar checklist. ${error instanceof Error ? error.message : 'Verifique o formato do arquivo.'}`);
      // Important: Return false here to indicate failure
      return false;
    }
  };

  return {
    importFromFile,
    getTemplateFileUrl
  };
}
