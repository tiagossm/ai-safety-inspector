
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewChecklistPayload } from '@/types/newChecklist';
import { toast } from 'sonner';

/**
 * Hook for creating a new checklist
 */
export function useChecklistCreateMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (checklistData: NewChecklistPayload) => {
      // Validate required fields
      if (!checklistData.title) {
        throw new Error('O título é obrigatório');
      }

      // Ensure all required properties are present
      const payload = {
        title: checklistData.title,
        description: checklistData.description || '',
        is_template: checklistData.is_template || false,
        status: checklistData.status || 'active',
        category: checklistData.category || '',
        company_id: checklistData.company_id || null,
        responsible_id: checklistData.responsible_id || null,
        user_id: checklistData.user_id || null,
        origin: checklistData.origin || 'manual'
      };

      const { data, error } = await supabase
        .from('checklists')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return { id: data.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-checklists"] });
      toast.success("Checklist criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar checklist: ${error.message}`);
    }
  });
}
