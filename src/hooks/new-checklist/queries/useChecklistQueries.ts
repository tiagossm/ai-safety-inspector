
import { supabase } from '@/integrations/supabase/client';
import { ChecklistWithStats } from '@/types/newChecklist';
import { transformDbChecklistsToStats } from '@/services/checklist/checklistTransformers';

/**
 * Fetch all checklists with related data
 */
export const fetchChecklists = async (): Promise<ChecklistWithStats[]> => {
  const { data, error } = await supabase
    .from('checklists')
    .select(`
      *,
      companies:company_id (id, fantasy_name)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  // Also fetch question counts for each checklist
  const checklistsWithCounts = await Promise.all(
    data.map(async (checklist) => {
      const { count, error: countError } = await supabase
        .from('checklist_itens')
        .select('*', { count: 'exact', head: true })
        .eq('checklist_id', checklist.id);
        
      return {
        ...checklist,
        totalQuestions: count || 0
      };
    })
  );
  
  return transformDbChecklistsToStats(checklistsWithCounts);
};

/**
 * Fetch a single checklist by ID
 */
export const fetchChecklistById = async (id: string): Promise<ChecklistWithStats | null> => {
  const { data, error } = await supabase
    .from('checklists')
    .select(`
      *,
      companies:company_id (id, fantasy_name)
    `)
    .eq('id', id)
    .single();
    
  if (error) return null;
  
  // Get question count
  const { count, error: countError } = await supabase
    .from('checklist_itens')
    .select('*', { count: 'exact', head: true })
    .eq('checklist_id', id);
  
  const checklistWithCount = {
    ...data,
    totalQuestions: count || 0
  };
  
  const [transformedChecklist] = transformDbChecklistsToStats([checklistWithCount]);
  return transformedChecklist;
};

/**
 * Update a checklist's status
 */
export const updateChecklistStatus = async (id: string, status: 'active' | 'inactive'): Promise<boolean> => {
  const { error } = await supabase
    .from('checklists')
    .update({ status })
    .eq('id', id);
    
  return !error;
};

/**
 * Update multiple checklists' statuses at once
 */
export const updateChecklistsStatus = async (ids: string[], status: 'active' | 'inactive'): Promise<boolean> => {
  const { error } = await supabase
    .from('checklists')
    .update({ status })
    .in('id', ids);
    
  return !error;
};

/**
 * Delete a checklist
 */
export const deleteChecklist = async (id: string): Promise<boolean> => {
  // First delete dependent records (questions)
  const { error: itemsError } = await supabase
    .from('checklist_itens')
    .delete()
    .eq('checklist_id', id);
  
  if (itemsError) return false;
  
  // Then delete the checklist itself
  const { error } = await supabase
    .from('checklists')
    .delete()
    .eq('id', id);
    
  return !error;
};
