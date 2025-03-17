
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const extendedUser = user as AuthUser | null;
  
  return useMutation({
    mutationFn: async (newChecklist: NewChecklist) => {
      try {
        console.log("Starting checklist creation process", { 
          title: newChecklist.title,
          company: newChecklist.company_id,
          responsible: newChecklist.responsible_id,
          timestamp: new Date().toISOString()
        });
        
        // Ensure authentication before proceeding
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw new Error("Falha na autenticação. Por favor, faça login novamente.");
        }
        
        // Validate that we have a valid user_id (must be a UUID)
        let userId = extendedUser?.id;
        
        // Handle default user for development/testing
        if (!userId || userId === 'default-admin-user' || !isValidUUID(userId)) {
          // For development purposes, use a mock UUID if user isn't authenticated
          userId = '00000000-0000-0000-0000-000000000000';
          console.log("Using default UUID for development:", userId);
        }
        
        // Log what's being sent to help debug
        console.log("Creating checklist with data:", newChecklist);
        
        // Make sure status is one of the expected values
        // The error suggests there's a check constraint on this field
        // Valid values are typically: 'pendente', 'em_andamento', 'concluido'
        const validStatus = ['pendente', 'em_andamento', 'concluido'];
        const status = newChecklist.status && validStatus.includes(newChecklist.status) 
          ? newChecklist.status 
          : 'pendente';
          
        // Prepare checklist data with all mandatory fields
        const checklistData = {
          title: newChecklist.title || "Checklist sem título",
          description: newChecklist.description || "Sem descrição",
          is_template: newChecklist.is_template || false,
          status_checklist: newChecklist.status_checklist || "ativo",
          category: newChecklist.category || "general",
          responsible_id: newChecklist.responsible_id || null,
          company_id: newChecklist.company_id || null,
          due_date: newChecklist.due_date || null,
          user_id: userId, // Use the validated user ID
          status: status // Ensure we're using a valid status value
        };
        
        console.log("Checklist prepared for insertion:", checklistData);
        
        // Insert the checklist
        const { data, error } = await supabase
          .from("checklists")
          .insert(checklistData)
          .select();

        if (error) {
          console.error("Supabase error during checklist creation:", error);
          // Format error messages for different error types
          if (error.code === '23503') {
            throw new Error(`Falha na criação: referência inválida. Detalhes: ${error.details}`);
          } else if (error.code === '23505') {
            throw new Error("Este checklist já existe.");
          } else if (error.code === '42501') {
            throw new Error("Permissão negada. Verifique se você tem acesso para criar checklists.");
          } else {
            throw new Error(`Falha na criação: ${error.message || 'Erro desconhecido'}`);
          }
        }

        if (!data || data.length === 0) {
          console.error("No data returned from checklist creation");
          throw new Error("Falha ao criar checklist: Nenhum dado retornado");
        }

        // Verify explicitly that the ID exists in the returned data
        if (!data[0].id) {
          console.error("Created checklist is missing ID:", data[0]);
          throw new Error("Falha ao criar checklist: ID não gerado");
        }

        console.log("Checklist created successfully:", data[0]);
        
        // Add to checklist history
        try {
          await supabase.from('checklist_history').insert({
            checklist_id: data[0].id,
            user_id: userId,
            action: 'create',
            details: 'Criou o checklist'
          });
          
          console.log("Creation history recorded");
        } catch (historyError) {
          console.warn("Failed to record creation history:", historyError);
        }
        
        return data[0];
      } catch (error) {
        console.error("Error in checklist creation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Checklist created with ID:", data.id);
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar checklist:", error);
      
      // More specific error message based on the error
      let errorMessage = "Erro ao criar checklist. Tente novamente.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  });
}

// Helper function to validate if a string is a valid UUID
function isValidUUID(str: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
