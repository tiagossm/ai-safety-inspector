import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistQuestion, ChecklistGroup, ChecklistOrigin } from '@/types/newChecklist';

export function useChecklistById(id: string) {
  const [checklist, setChecklist] = useState<ChecklistWithStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Used for component API compatibility
  const data = checklist;
  const isLoading = loading;

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Also fetch user data separately to avoid join errors
      let responsibleName = '';
      if (data.user_id) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name')
          .eq('id', data.user_id)
          .single();
          
        if (!userError && userData) {
          responsibleName = userData.name || '';
        }
      }

      // Get questions for this checklist
      const { data: questionsData, error: questionsError } = await supabase
        .from('checklist_itens')
        .select('*')
        .eq('checklist_id', id)
        .order('ordem', { ascending: true });
      
      if (questionsError) throw questionsError;

      // Transform questions to the expected format
      const questions: ChecklistQuestion[] = questionsData.map((item: any) => {
        let options: string[] = [];
        if (item.opcoes) {
          options = Array.isArray(item.opcoes) ? item.opcoes : [];
        }
        
        return {
          id: item.id,
          text: item.pergunta,
          responseType: mapResponseType(item.tipo_resposta),
          isRequired: item.obrigatorio,
          options: options,
          order: item.ordem,
          allowsPhoto: item.permite_foto,
          allowsVideo: item.permite_video,
          allowsAudio: item.permite_audio,
          weight: item.weight || 1,
          groupId: item.group_id,
          parentId: item.parent_item_id,
          conditionValue: item.condition_value,
          displayNumber: `${item.ordem + 1}`,
          parent_question_id: item.parent_item_id,
          hint: item.hint,
          hasSubChecklist: item.has_subchecklist || false,
          subChecklistId: item.sub_checklist_id
        };
      });

      // TypeScript safeguards for enum types
      const statusValue = data.status === 'active' ? 'active' : 'inactive' as "active" | "inactive";
      const originValue = (data.origin || 'manual') as ChecklistOrigin;

      // Transform to the expected format and ensure the status is of correct type
      const formattedChecklist: ChecklistWithStats = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        is_template: data.is_template || false,
        isTemplate: data.is_template || false,
        status: statusValue,
        category: data.category || '',
        responsible_id: data.responsible_id,
        responsibleId: data.responsible_id,
        company_id: data.company_id,
        companyId: data.company_id,
        user_id: data.user_id,
        userId: data.user_id,
        created_at: data.created_at,
        createdAt: data.created_at,
        updated_at: data.updated_at,
        updatedAt: data.updated_at,
        due_date: data.due_date,
        dueDate: data.due_date,
        is_sub_checklist: data.is_sub_checklist || false,
        isSubChecklist: data.is_sub_checklist || false,
        origin: originValue,
        parent_question_id: data.parent_question_id,
        totalQuestions: questionsData.length,
        completedQuestions: 0,
        companyName: data.companies?.fantasy_name || '',
        responsibleName: responsibleName,
        questions: questions,
        groups: []
      };
      
      setChecklist(formattedChecklist);
      setError(null);
    } catch (err) {
      console.error("Error fetching checklist:", err);
      setError(err as Error);
      setChecklist(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchChecklist();
    } else {
      setLoading(false);
      setChecklist(null);
    }
  }, [id]);

  const refetch = () => {
    fetchChecklist();
  };

  return { 
    checklist, 
    loading, 
    error, 
    setChecklist,
    // For compatibility with components expecting React Query style hooks
    data,
    isLoading,
    refetch
  };
}

// Helper function to map response types
function mapResponseType(type: string): "yes_no" | "numeric" | "text" | "multiple_choice" | "photo" | "signature" {
  const typeMap: Record<string, any> = {
    'sim/não': 'yes_no',
    'numérico': 'numeric',
    'texto': 'text',
    'múltipla escolha': 'multiple_choice',
    'seleção múltipla': 'multiple_choice',
    'foto': 'photo',
    'assinatura': 'signature'
  };
  
  return typeMap[type] || 'text';
}

export default useChecklistById;
