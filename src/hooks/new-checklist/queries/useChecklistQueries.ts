
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistOrigin } from "@/types/newChecklist";
import { transformDbChecklistsToStats } from "@/services/checklist/checklistTransformers";

export const fetchChecklistById = async (id: string): Promise<ChecklistWithStats | null> => {
  try {
    const { data, error } = await supabase
      .from('checklists')
      .select(`
        *,
        companies:company_id (id, fantasy_name)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching checklist by ID:", error);
      return null;
    }
    
    // Ensure origin is a valid ChecklistOrigin
    const origin = data.origin || 'manual';
    const validOrigin: ChecklistOrigin = ['manual', 'ia', 'csv'].includes(origin) 
      ? origin as ChecklistOrigin 
      : 'manual';
    
    // Process data with valid origin
    const processedData = {
      ...data,
      origin: validOrigin
    };
    
    return transformDbChecklistsToStats([processedData])[0];
  } catch (error) {
    console.error("Error in fetchChecklistById:", error);
    return null;
  }
};

export const fetchChecklists = async (): Promise<ChecklistWithStats[]> => {
  try {
    const { data, error } = await supabase
      .from('checklists')
      .select(`
        *,
        companies:company_id (id, fantasy_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching checklists:", error);
      throw error;
    }
    
    return transformDbChecklistsToStats(data || []);
  } catch (error) {
    console.error("Error in fetchChecklists:", error);
    return [];
  }
};

export const useChecklistQuery = (id: string) => {
  return useQuery({
    queryKey: ['checklist', id],
    queryFn: () => fetchChecklistById(id),
    enabled: !!id
  });
};

export const useChecklistsQuery = () => {
  return useQuery({
    queryKey: ['checklists'],
    queryFn: fetchChecklists
  });
};
