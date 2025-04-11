
import { useMutation } from "@tanstack/react-query";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CreateChecklistResponse {
  id: string;
  title: string;
  [key: string]: any;
}

export function useCreateChecklist() {
  const navigate = useNavigate();

  const mutation = useMutation<CreateChecklistResponse, Error, NewChecklist>({
    mutationFn: async (newChecklist: NewChecklist) => {
      try {
        console.log("Creating checklist with data:", newChecklist);
        
        // Insert the new checklist
        const { data, error } = await supabase
          .from("checklists")
          .insert({
            title: newChecklist.title,
            description: newChecklist.description,
            category: newChecklist.category,
            user_id: newChecklist.user_id,
            responsible_id: newChecklist.responsible_id,
            company_id: newChecklist.company_id,
            is_template: newChecklist.is_template,
            status_checklist: newChecklist.status_checklist || "ativo",
            status: newChecklist.status || "pendente",
            due_date: newChecklist.due_date,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating checklist:", error);
          throw new Error(`Failed to create checklist: ${error.message}`);
        }

        if (!data) {
          throw new Error("No data returned after creating checklist");
        }

        // Instead of trying to insert into checklist_groups (which doesn't exist),
        // we'll store group information in the questions' hint field as JSON
        
        return data as CreateChecklistResponse;
      } catch (error) {
        console.error("Error in createChecklist:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Checklist criado com sucesso!");
      navigate(`/new-checklists/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar checklist: ${error.message}`);
    },
  });

  return mutation;
}
