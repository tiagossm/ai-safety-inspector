
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
        // Log what we're sending to help debug
        console.log("Creating checklist with data:", newChecklist);
        
        if (!extendedUser?.company_id && !newChecklist.company_id) {
          console.error("No company_id available for checklist creation");
          throw new Error("Não foi possível criar o checklist: ID da empresa não está disponível");
        }
        
        const { data, error } = await supabase
          .from("checklists")
          .insert({
            title: newChecklist.title,
            description: newChecklist.description,
            is_template: newChecklist.is_template || false,
            status_checklist: "ativo",
            category: newChecklist.category || "general",
            responsible_id: newChecklist.responsible_id,
            company_id: newChecklist.company_id || extendedUser?.company_id,
            due_date: newChecklist.due_date || null,
            user_id: extendedUser?.id // Ensure user_id is set
          })
          .select();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.error("No data returned from checklist creation");
          throw new Error("Falha ao criar checklist: Nenhum dado retornado");
        }

        console.log("Checklist created successfully:", data[0]);
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
        // Check for Supabase-specific errors
        if ('code' in error && 'details' in error && 'hint' in error) {
          const supabaseError = error as any;
          if (supabaseError.code === '23505') {
            errorMessage = "Este checklist já existe.";
          } else if (supabaseError.code === '23503') {
            errorMessage = "Referência inválida no checklist.";
          } else if (supabaseError.message) {
            errorMessage = `Erro: ${supabaseError.message}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    }
  });
}
