
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
        // Log o que está sendo enviado para ajudar a depurar
        console.log("Creating checklist with data:", newChecklist);
        
        // Preparar dados do checklist
        const checklistData = {
          title: newChecklist.title,
          description: newChecklist.description,
          is_template: newChecklist.is_template || false,
          status_checklist: "ativo",
          category: newChecklist.category || "general",
          responsible_id: newChecklist.responsible_id || null,
          company_id: newChecklist.company_id || extendedUser?.company_id || null,
          due_date: newChecklist.due_date || null,
          user_id: extendedUser?.id // Garante que user_id está definido
        };
        
        console.log("Checklist preparado para inserção:", checklistData);
        
        // Inserir o checklist
        const { data, error } = await supabase
          .from("checklists")
          .insert(checklistData)
          .select();

        if (error) {
          console.error("Supabase error during checklist creation:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.error("No data returned from checklist creation");
          throw new Error("Falha ao criar checklist: Nenhum dado retornado");
        }

        // Verificar explicitamente se o ID existe nos dados retornados
        if (!data[0].id) {
          console.error("Created checklist is missing ID:", data[0]);
          throw new Error("Falha ao criar checklist: ID não gerado");
        }

        console.log("Checklist created successfully:", data[0]);
        
        // Salvar também no IndexedDB se tivermos a funcionalidade de sincronia offline
        try {
          const { saveForSync } = await import('@/services/offlineSync');
          await saveForSync('checklists', 'insert', data[0]);
          console.log("Checklist also saved for offline sync");
        } catch (syncError) {
          // Não é um erro crítico, apenas registre
          console.warn("Could not save checklist for offline sync:", syncError);
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
      
      // Mensagem de erro mais específica com base no erro
      let errorMessage = "Erro ao criar checklist. Tente novamente.";
      
      if (error instanceof Error) {
        // Verificar erros específicos do Supabase
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
