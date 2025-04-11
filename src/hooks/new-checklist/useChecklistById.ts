
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChecklistQuestion, ChecklistGroup, ChecklistWithStats } from '@/types/newChecklist';

export function useChecklistById(id?: string) {
  const params = useParams();
  const checklistId = id || params.id;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ChecklistWithStats | null>(null);
  
  const fetchChecklist = async () => {
    try {
      setLoading(true);
      
      if (!checklistId) {
        throw new Error('Checklist ID is required');
      }
      
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklists')
        .select(`
          *,
          companies(*),
          users:responsible_id(*)
        `)
        .eq('id', checklistId)
        .single();
      
      if (checklistError) throw checklistError;
      
      const { data: questionsData, error: questionsError } = await supabase
        .from('checklist_itens')
        .select('*')
        .eq('checklist_id', checklistId)
        .order('ordem', { ascending: true });
      
      if (questionsError) throw questionsError;
      
      const { data: groupsData, error: groupsError } = await supabase
        .from('checklist_groups')
        .select('*')
        .eq('checklist_id', checklistId)
        .order('order', { ascending: true });
      
      // If the groups table doesn't exist, we'll just ignore this error
      if (groupsError && !groupsError.message.includes('relation "checklist_groups" does not exist')) {
        throw groupsError;
      }
        
      // Transform database models to our frontend models
      const questions: ChecklistQuestion[] = questionsData.map(item => ({
        id: item.id,
        text: item.pergunta,
        responseType: item.tipo_resposta,
        isRequired: item.obrigatorio,
        allowsPhoto: item.permite_foto,
        allowsVideo: item.permite_video,
        allowsAudio: item.permite_audio,
        options: item.opcoes,
        hint: item.hint,
        weight: item.weight,
        order: item.ordem,
        groupId: item.group_id || null,
        parentQuestionId: item.parent_item_id,
        subChecklistId: item.sub_checklist_id,
        hasSubChecklist: item.has_subchecklist || false,
        conditionValue: item.condition_value
      }));
      
      const groups: ChecklistGroup[] = (groupsData || []).map(item => ({
        id: item.id,
        title: item.title,
        order: item.order
      }));
      
      // Build the result object with frontend model
      const result: ChecklistWithStats = {
        id: checklistData.id,
        title: checklistData.title,
        description: checklistData.description,
        isTemplate: checklistData.is_template,
        is_template: checklistData.is_template,
        status: checklistData.status,
        category: checklistData.category,
        theme: checklistData.theme,
        responsibleId: checklistData.responsible_id,
        companyId: checklistData.company_id,
        userId: checklistData.user_id,
        createdAt: checklistData.created_at,
        updatedAt: checklistData.updated_at,
        dueDate: checklistData.due_date,
        isSubChecklist: checklistData.is_sub_checklist,
        origin: checklistData.origin,
        totalQuestions: questions.length,
        completedQuestions: 0,
        companyName: checklistData.companies?.fantasy_name,
        responsibleName: checklistData.users?.name,
        questions,
        groups
      };
      
      setData(result);
    } catch (err) {
      console.error('Error fetching checklist:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  const refetch = () => {
    fetchChecklist();
  };
  
  useEffect(() => {
    if (checklistId) {
      fetchChecklist();
    }
  }, [checklistId]);
  
  return { data, loading, error, refetch };
}
