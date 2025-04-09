
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistOrigin } from "@/types/newChecklist";

export function useChecklistById(id: string) {
  const [checklist, setChecklist] = useState<ChecklistWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchChecklistDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id) {
        setLoading(false);
        return;
      }
      
      // Fetch checklist data
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name)
        `)
        .eq('id', id)
        .single();
      
      if (checklistError) {
        throw checklistError;
      }
      
      // Fetch questions count
      const { count: totalQuestions, error: countError } = await supabase
        .from('checklist_itens')
        .select('*', { count: 'exact', head: true })
        .eq('checklist_id', id);
      
      if (countError) {
        console.error("Error fetching questions count:", countError);
      }
      
      // Fetch responsible user if exists
      let responsibleName = '';
      if (checklistData.user_id) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name')
          .eq('id', checklistData.user_id)
          .single();
        
        if (!userError && userData) {
          responsibleName = userData.name || '';
        }
      }
      
      // Normalize the origin value to ensure it matches ChecklistOrigin type
      const normalizedOrigin = normalizeOrigin(checklistData.origin);
      
      // Transform data to match the ChecklistWithStats type
      const result: ChecklistWithStats = {
        id: checklistData.id,
        title: checklistData.title,
        description: checklistData.description || '',
        is_template: checklistData.is_template || false,
        isTemplate: checklistData.is_template || false,
        status: checklistData.status === 'active' ? 'active' : 'inactive',
        category: checklistData.category || '',
        responsible_id: checklistData.responsible_id,
        responsibleId: checklistData.responsible_id,
        company_id: checklistData.company_id,
        companyId: checklistData.company_id,
        user_id: checklistData.user_id,
        userId: checklistData.user_id,
        created_at: checklistData.created_at,
        createdAt: checklistData.created_at,
        updated_at: checklistData.updated_at,
        updatedAt: checklistData.updated_at,
        due_date: checklistData.due_date,
        dueDate: checklistData.due_date,
        is_sub_checklist: checklistData.is_sub_checklist || false,
        isSubChecklist: checklistData.is_sub_checklist || false,
        origin: normalizedOrigin,
        parent_question_id: checklistData.parent_question_id,
        parentQuestionId: checklistData.parent_question_id,
        totalQuestions: totalQuestions || 0,
        completedQuestions: 0,
        companyName: checklistData.companies?.fantasy_name || '',
        responsibleName
      };
      
      setChecklist(result);
    } catch (err) {
      console.error("Error fetching checklist:", err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar checklist'));
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to ensure origin is a valid ChecklistOrigin type
  const normalizeOrigin = (origin: any): ChecklistOrigin => {
    if (origin === 'ia' || origin === 'csv') {
      return origin;
    }
    return 'manual';
  };
  
  useEffect(() => {
    fetchChecklistDetails();
  }, [id]);
  
  return {
    checklist,
    loading,
    error,
    refetch: fetchChecklistDetails
  };
}
