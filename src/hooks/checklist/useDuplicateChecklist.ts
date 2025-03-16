
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useDuplicateChecklist() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: async (checklistId: string) => {
      console.log("Starting duplication of checklist:", checklistId);
      
      try {
        // First, get the original checklist data
        const { data: originalChecklist, error: checklistError } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", checklistId)
          .single();
        
        if (checklistError) {
          console.error("Error fetching original checklist:", checklistError);
          throw checklistError;
        }
        
        console.log("Original checklist data fetched:", originalChecklist);
        
        // Create a new checklist based on the original
        const { data: newChecklist, error: createError } = await supabase
          .from("checklists")
          .insert({
            title: `${originalChecklist.title} (Cópia)`,
            description: originalChecklist.description,
            is_template: originalChecklist.is_template,
            status_checklist: originalChecklist.status_checklist,
            category: originalChecklist.category,
            responsible_id: originalChecklist.responsible_id,
            company_id: originalChecklist.company_id,
            user_id: originalChecklist.user_id
          })
          .select()
          .single();
        
        if (createError) {
          console.error("Error creating duplicate checklist:", createError);
          throw createError;
        }
        
        console.log("New checklist created:", newChecklist);
        
        // Get all items from the original checklist
        const { data: originalItems, error: itemsError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", checklistId)
          .order("ordem", { ascending: true });
        
        if (itemsError) {
          console.error("Error fetching original items:", itemsError);
          throw itemsError;
        }
        
        console.log(`Found ${originalItems?.length || 0} items to duplicate`);
        
        // Create duplicate items for the new checklist
        if (originalItems && originalItems.length > 0) {
          const newItems = originalItems.map(item => {
            // Create a base object with required properties
            const newItem: any = {
              checklist_id: newChecklist.id,
              pergunta: item.pergunta,
              tipo_resposta: item.tipo_resposta,
              obrigatorio: item.obrigatorio,
              ordem: item.ordem,
              opcoes: item.opcoes,
              permite_foto: item.permite_foto,
              permite_audio: item.permite_audio,
              permite_video: item.permite_video
            };
            
            // Only add condicao if it exists in the original item
            if ('condicao' in item && item.condicao !== null) {
              newItem.condicao = item.condicao;
            }
            
            return newItem;
          });
          
          console.log("Preparing to insert new items:", newItems.length);
          
          const { error: insertError } = await supabase
            .from("checklist_itens")
            .insert(newItems);
          
          if (insertError) {
            console.error("Error inserting duplicate items:", insertError);
            throw insertError;
          }
          
          console.log("Successfully duplicated all items");
        }
        
        return newChecklist;
      } catch (error) {
        console.error("Error in duplication process:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      toast.success("Checklist duplicado com sucesso!");
      navigate(`/checklists/${data.id}`);
    },
    onError: (error) => {
      console.error("Erro ao duplicar checklist:", error);
      toast.error("Falha ao duplicar checklist");
    }
  });
}
