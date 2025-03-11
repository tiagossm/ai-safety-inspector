
import { toast } from "sonner";
import { useCreateChecklist } from "@/hooks/checklist/useCreateChecklist"; 
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

/**
 * Validates if the file is in correct format (CSV, XLS, XLSX)
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
  const { user } = useAuth();
  const typedUser = user as AuthUser | null;

  const getTemplateFileUrl = () => {
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/templates/checklist_import_template.xlsx`;
  };

  const importFromFile = async (file: File, form: NewChecklist) => {
    // Validate file exists
    if (!file) {
      toast.error("Nenhum arquivo selecionado");
      return false;
    }
    
    // Validate file format
    const validation = validateFileFormat(file);
    if (!validation.valid) {
      toast.error(validation.message || "Arquivo inválido");
      return false;
    }
    
    try {
      console.log("Importing from file:", file.name, "Size:", Math.round(file.size / 1024), "KB");
      
      // Ensure the form has user_id set
      if (!form.user_id && typedUser?.id) {
        form.user_id = typedUser.id;
        console.log("Added user_id to form:", form.user_id);
      }
      
      console.log("User details for import:", {
        id: typedUser?.id,
        role: typedUser?.role,
        tier: typedUser?.tier,
        email: typedUser?.email
      });
      
      // Get the current session JWT
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast.error("Você precisa estar autenticado para importar um checklist");
        return false;
      }
      
      if (!sessionData.session) {
        console.error("No active session");
        toast.error("Sessão inválida. Faça login novamente.");
        return false;
      }
      
      const jwt = sessionData.session.access_token;
      console.log("JWT token acquired, length:", jwt.length);
      
      // Create a FormData instance
      const formData = new FormData();
      formData.append('file', file);
      
      // Add form data as JSON string
      formData.append('form', JSON.stringify({
        ...form,
        user_id: typedUser?.id
      }));
      
      console.log("Form data prepared:", form);
      
      // Use try/catch to handle potential errors from the function invocation
      try {
        console.log("Calling edge function to process CSV...");
        const { data, error } = await supabase.functions.invoke('process-checklist-csv', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`
            // Important: Do NOT set Content-Type when using FormData
          },
          body: formData
        });
        
        if (error) {
          console.error("Edge function returned error:", error);
          if (error.message?.includes('JWT') || error.message?.includes('auth') || error.message?.includes('401')) {
            toast.error("Erro de autenticação. Faça login novamente.");
          } else {
            toast.error(`Erro na importação: ${error.message || 'Falha desconhecida'}`);
          }
          return false;
        }
        
        console.log("Edge function result:", data);
        
        if (data?.success) {
          toast.success(`Checklist importado com sucesso! ${data.processed_items || 0} itens processados.`);
          return data;
        } else {
          const errorMsg = data?.error || "Erro ao importar checklist";
          console.error("Import failed with error:", errorMsg);
          toast.error(errorMsg);
          return false;
        }
      } catch (invocationError: any) {
        console.error("Function invocation error:", invocationError);
        // Check if this is a JWT authentication error
        if (invocationError.message?.includes('401') || 
            invocationError.message?.includes('JWT') || 
            invocationError.message?.includes('auth')) {
          toast.error("Sua sessão expirou, faça login novamente");
        } else {
          toast.error(`Erro ao processar arquivo: ${invocationError.message}`);
        }
        return false;
      }
    } catch (error: any) {
      console.error("Error importing checklist:", error);
      // Check for JWT-related errors
      if (error.message?.includes('401') || 
          error.message?.includes('JWT') || 
          error.message?.includes('auth')) {
        toast.error("Sua sessão expirou, faça login novamente");
      } else {
        toast.error(`Erro ao importar checklist. ${error.message}`);
      }
      return false;
    }
  };

  return {
    importFromFile,
    getTemplateFileUrl
  };
}
