
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewChecklist } from "@/types/checklist";
import { useAuth } from "@/components/AuthProvider";

// Interface estendida para o User
interface ExtendedUser {
  id: string;
  email: string;
  role?: string;
  tier?: string;
  company_id?: string;
  [key: string]: any;
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const extendedUser = user as ExtendedUser | null;
  
  return useMutation({
    mutationFn: async (newChecklist: NewChecklist) => {
      // Log what we're sending to help debug
      console.log("Creating checklist with data:", newChecklist);
      
      const { data, error } = await supabase
        .from("checklists")
        .insert({
          title: newChecklist.title,
          description: newChecklist.description,
          is_template: newChecklist.is_template || false,
          status_checklist: "ativo",
          category: newChecklist.category || "general",
          responsible_id: newChecklist.responsible_id,
          company_id: newChecklist.company_id || extendedUser?.company_id
        })
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar checklist:", error);
      toast.error("Erro ao criar checklist. Tente novamente.");
    }
  });
}
