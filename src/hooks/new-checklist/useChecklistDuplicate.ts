
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for duplicating an existing checklist with all its items
 */
export function useChecklistDuplicate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checklistId: string) => {
      // Step 1: Get the original checklist
      const { data: originalChecklist, error: fetchError } = await supabase
        .from('checklists')
        .select('*')
        .eq('id', checklistId)
        .single();

      if (fetchError) throw fetchError;

      if (!originalChecklist) {
        throw new Error('Checklist not found');
      }

      // Step 2: Create a duplicate with modified title
      const newChecklistData = { 
        ...originalChecklist,
        id: undefined, // Supabase will generate a new ID
        created_at: undefined, // Will be set by default value in DB
        updated_at: undefined, // Will be set by default value in DB
        title: `${originalChecklist.title} (Cópia)`,
      };

      const { data: newChecklist, error: insertError } = await supabase
        .from('checklists')
        .insert(newChecklistData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Step 3: Get all items from the original checklist
      const { data: originalItems, error: itemsError } = await supabase
        .from('checklist_itens')
        .select('*')
        .eq('checklist_id', checklistId);

      if (itemsError) throw itemsError;

      if (originalItems && originalItems.length > 0) {
        // Step 4: Create duplicate items for the new checklist
        const newItems = originalItems.map(item => ({
          ...item,
          id: undefined, // Supabase will generate a new ID
          created_at: undefined, // Will be set by default value in DB
          updated_at: undefined, // Will be set by default value in DB
          checklist_id: newChecklist.id,
        }));

        const { error: bulkInsertError } = await supabase
          .from('checklist_itens')
          .insert(newItems);

        if (bulkInsertError) throw bulkInsertError;
      }

      return newChecklist;
    },
    onSuccess: () => {
      // Invalidate and refetch checklists query to update the list
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist duplicado com sucesso');
    },
    onError: (error) => {
      console.error('Error duplicating checklist:', error);
      toast.error('Erro ao duplicar checklist');
    }
  });
}
