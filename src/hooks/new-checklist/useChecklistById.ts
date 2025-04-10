
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistWithStats, ChecklistOrigin } from "@/types/newChecklist";
import { transformDbChecklistsToStats } from "@/services/checklist/checklistTransformers";

export function useChecklistById(id: string) {
  const fetchChecklistById = async (checklistId: string): Promise<ChecklistWithStats | null> => {
    try {
      // Fetch basic checklist data with company name
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklists')
        .select(`
          *,
          companies:company_id (id, fantasy_name)
        `)
        .eq('id', checklistId)
        .single();
      
      if (checklistError) {
        console.error("Error fetching checklist by ID:", checklistError);
        return null;
      }

      // Fetch questions for this checklist
      const { data: questionData, error: questionsError } = await supabase
        .from('checklist_itens')
        .select('*')
        .eq('checklist_id', checklistId)
        .order('ordem', { ascending: true });
      
      if (questionsError) {
        console.error("Error fetching checklist questions:", questionsError);
      }

      const questions = questionsError ? [] : questionData.map((q: any) => ({
        id: q.id,
        text: q.pergunta,
        responseType: q.tipo_resposta || 'sim/não',
        isRequired: q.obrigatorio || true,
        weight: q.weight || 1,
        order: q.ordem || 0,
        allowsPhoto: q.permite_foto || false,
        allowsVideo: q.permite_video || false,
        allowsAudio: q.permite_audio || false,
        allowsFiles: false,
        options: q.opcoes || [],
        hint: q.hint || null,
        groupId: null,
        displayNumber: `${(q.ordem || 0) + 1}`,
        parentQuestionId: q.parent_item_id || null,
        hasSubChecklist: q.has_subchecklist || false,
        subChecklistId: q.sub_checklist_id || null,
        conditionValue: q.condition_value || null
      }));

      // Also fetch user info for the responsible name if needed
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
      
      // Fix any potential issues with company name
      let companyName = checklistData.companies?.fantasy_name || null;
      
      if (checklistData.company_id && !companyName) {
        // Try to fetch company name directly if relation didn't work
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('fantasy_name')
          .eq('id', checklistData.company_id)
          .single();
          
        if (!companyError && companyData) {
          companyName = companyData.fantasy_name;
        }
      }

      // Transform data and ensure origin is set correctly
      const origin = checklistData.origin || 'manual';
      // Validate that origin is a valid ChecklistOrigin
      const validOrigin: ChecklistOrigin = ['manual', 'ia', 'csv'].includes(origin) 
        ? origin as ChecklistOrigin 
        : 'manual';

      const checklist: ChecklistWithStats = {
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
        origin: validOrigin,
        parent_question_id: checklistData.parent_question_id,
        parentQuestionId: checklistData.parent_question_id,
        totalQuestions: questions.length,
        completedQuestions: 0,
        companyName: companyName,
        responsibleName: responsibleName,
        questions: questions,
        groups: [] // No groups yet
      };

      return checklist;
    } catch (error) {
      console.error("Error in useChecklistById:", error);
      return null;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['checklist', id],
    queryFn: () => fetchChecklistById(id),
    enabled: !!id
  });

  return {
    checklist: data,
    loading: isLoading,
    error,
    refetch
  };
}
