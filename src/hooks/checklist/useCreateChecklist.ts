
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
      // Log what we're sending to help debug
      console.log("Creating checklist with data:", newChecklist);
      
      // Get user details if not available from context
      let userCompanyId = extendedUser?.company_id;
      
      if (!userCompanyId) {
        try {
          console.log("Fetching user's company_id from database");
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("company_id")
            .eq("id", user?.id)
            .single();
            
          if (userError) {
            console.error("Error fetching user data:", userError);
          } else {
            userCompanyId = userData?.company_id;
            console.log("Found company_id:", userCompanyId);
          }
        } catch (err) {
          console.error("Error in company_id lookup:", err);
        }
      }
      
      // Always use the provided company_id if available, otherwise fallback to the user's company_id
      const effectiveCompanyId = newChecklist.company_id || userCompanyId;
      
      const { data, error } = await supabase
        .from("checklists")
        .insert({
          title: newChecklist.title,
          description: newChecklist.description,
          is_template: newChecklist.is_template || false,
          status_checklist: "ativo",
          category: newChecklist.category || "general",
          responsible_id: newChecklist.responsible_id,
          company_id: effectiveCompanyId,
          user_id: user?.id,
          due_date: newChecklist.due_date || null
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
