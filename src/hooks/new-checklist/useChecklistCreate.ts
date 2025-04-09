
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NewChecklistPayload, ChecklistQuestion, ChecklistGroup } from '@/types/newChecklist';
import { toast } from 'sonner';

export function useChecklistCreate() {
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const createChecklist = async (
    checklistData: NewChecklistPayload
  ): Promise<{ id: string; error: Error | null }> => {
    try {
      setIsCreating(true);

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
        status_checklist: checklistData.status_checklist || 'ativo',
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

      return { id: data.id, error: null };
    } catch (error) {
      console.error('Error creating checklist:', error);
      toast.error(`Erro ao criar checklist: ${(error as Error).message}`);
      return { id: '', error: error as Error };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    createChecklist
  };
}

export default useChecklistCreate;
