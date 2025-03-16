
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/components/AuthProvider";

export function useDuplicateChecklist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (checklistId: string) => {
      try {
        console.log("Starting checklist duplication for ID:", checklistId);
        
        // 1. Fetch the original checklist data
        const { data: originalChecklist, error: fetchError } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", checklistId)
          .single();
          
        if (fetchError) {
          console.error("Error fetching original checklist:", fetchError);
          throw fetchError;
        }
        
        if (!originalChecklist) {
          throw new Error("Checklist not found");
        }
        
        console.log("Original checklist fetched:", originalChecklist.title);
        
        // 2. Create a new checklist with modified data
        const newChecklistId = uuidv4();
        const newChecklist = {
          id: newChecklistId,
          title: `${originalChecklist.title} (Cópia)`,
          description: originalChecklist.description,
          status_checklist: originalChecklist.status_checklist,
          is_template: originalChecklist.is_template,
          category: originalChecklist.category,
          company_id: originalChecklist.company_id,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from("checklists")
          .insert(newChecklist);
          
        if (insertError) {
          console.error("Error creating new checklist:", insertError);
          throw insertError;
        }
        
        console.log("New checklist created with ID:", newChecklistId);
        
        // 3. Fetch all items from the original checklist
        const { data: originalItems, error: itemsError } = await supabase
          .from("checklist_itens")
          .select("*")
          .eq("checklist_id", checklistId);
          
        if (itemsError) {
          console.error("Error fetching original checklist items:", itemsError);
          throw itemsError;
        }
        
        console.log(`Found ${originalItems?.length || 0} items to duplicate`);
        
        if (originalItems && originalItems.length > 0) {
          // 4. Create new items for the duplicated checklist
          const newItems = originalItems.map(item => {
            // Create a base new item with required fields
            const newItem = {
              id: uuidv4(),
              checklist_id: newChecklistId,
              pergunta: item.pergunta,
              tipo_resposta: item.tipo_resposta,
              obrigatorio: item.obrigatorio,
              ordem: item.ordem,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              permite_foto: item.permite_foto,
              permite_video: item.permite_video,
              permite_audio: item.permite_audio,
              opcoes: item.opcoes
            };
            
            // Only add condicao property if it exists in the original item
            if ('condicao' in item && item.condicao !== null && item.condicao !== undefined) {
              return {
                ...newItem,
                condicao: item.condicao
              };
            }
            
            return newItem;
          });
          
          // 5. Insert all the new items
          const { error: insertItemsError } = await supabase
            .from("checklist_itens")
            .insert(newItems);
            
          if (insertItemsError) {
            console.error("Error inserting duplicated items:", insertItemsError);
            throw insertItemsError;
          }
          
          console.log(`Successfully duplicated ${newItems.length} items`);
        }
        
        console.log("Checklist duplication completed successfully");
        toast.success("Checklist duplicado com sucesso!");
        
        return newChecklistId;
      } catch (error: any) {
        console.error("Error in duplicateChecklist:", error);
        toast.error("Erro ao duplicar checklist", {
          description: error.message
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    }
  });
}
