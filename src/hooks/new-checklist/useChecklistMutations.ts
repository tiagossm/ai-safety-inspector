
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useChecklistMutations() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const deleteChecklist = async (id: string): Promise<void> => {
    setIsDeleting(true);
    try {
      // First delete related items
      const { error: itemsError } = await supabase
        .from('checklist_itens')
        .delete()
        .eq('checklist_id', id);

      if (itemsError) {
        console.error("Error deleting checklist items:", itemsError);
        throw itemsError;
      }

      // Then delete the checklist itself
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting checklist:", error);
        throw error;
      }

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['checklists'] });
    } catch (error) {
      console.error("Failed to delete checklist:", error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const updateStatus = async (id: string, status: 'active' | 'inactive'): Promise<void> => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('checklists')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['checklists'] });
    } catch (error) {
      console.error("Failed to update checklist status:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateBulkStatus = async (ids: string[], status: 'active' | 'inactive'): Promise<void> => {
    setIsUpdating(true);
    try {
      if (ids.length === 0) return;

      const { error } = await supabase
        .from('checklists')
        .update({ status })
        .in('id', ids);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['checklists'] });
    } catch (error) {
      console.error("Failed to update bulk checklist status:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ['checklists'] });
  };

  return {
    deleteChecklist,
    updateStatus,
    updateBulkStatus,
    refetch,
    isDeleting,
    isUpdating
  };
}
