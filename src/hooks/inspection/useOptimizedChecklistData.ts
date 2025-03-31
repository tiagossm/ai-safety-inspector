
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseOptimizedChecklistDataProps {
  checklistId: string | undefined;
  enabled?: boolean;
}

export function useOptimizedChecklistData({ checklistId, enabled = true }: UseOptimizedChecklistDataProps) {
  const queryClient = useQueryClient();

  // Buscar checklist e questões em uma única consulta otimizada
  const { data, isLoading, error } = useQuery({
    queryKey: ['optimized-checklist', checklistId],
    queryFn: async () => {
      if (!checklistId) throw new Error('Checklist ID is required');

      // Buscar o checklist e as questões em paralelo para otimizar o tempo de carregamento
      const [checklistResult, questionsResult] = await Promise.all([
        // Buscar dados do checklist
        supabase
          .from('checklists')
          .select(`
            id, 
            title, 
            description, 
            is_template, 
            status_checklist, 
            category, 
            responsible_id,
            company_id,
            user_id,
            created_at,
            updated_at,
            due_date
          `)
          .eq('id', checklistId)
          .single(),

        // Buscar questões do checklist
        supabase
          .from('checklist_itens')
          .select('*')
          .eq('checklist_id', checklistId)
          .order('ordem', { ascending: true })
      ]);

      if (checklistResult.error) throw checklistResult.error;
      if (questionsResult.error) throw questionsResult.error;

      // Processar questões para agrupar por grupo
      const groups = new Map();
      const DEFAULT_GROUP = { id: 'default', title: 'Geral', order: 0 };
      groups.set(DEFAULT_GROUP.id, DEFAULT_GROUP);

      const processedQuestions = (questionsResult.data || []).map((item: any) => {
        let groupId = DEFAULT_GROUP.id;
        
        // Extrair informação de grupo do hint
        if (item.hint) {
          try {
            const hint = typeof item.hint === 'string' ? JSON.parse(item.hint) : item.hint;
            if (hint.groupId && hint.groupTitle) {
              groupId = hint.groupId;
              if (!groups.has(groupId)) {
                groups.set(groupId, {
                  id: groupId,
                  title: hint.groupTitle,
                  order: hint.groupIndex || 0
                });
              }
            }
          } catch (e) {
            // Manter grupo default se falhar ao processar hint
          }
        }

        // Normalizar tipo de resposta
        const responseType = (() => {
          const type = item.tipo_resposta || '';
          if (type.toLowerCase().includes('sim/não')) return 'yes_no';
          if (type.toLowerCase().includes('múltipla')) return 'multiple_choice';
          if (type.toLowerCase().includes('texto')) return 'text';
          if (type.toLowerCase().includes('numérico')) return 'numeric';
          if (type.toLowerCase().includes('foto')) return 'photo';
          return type;
        })();

        return {
          id: item.id,
          text: item.pergunta,
          responseType,
          isRequired: item.obrigatorio,
          options: item.opcoes,
          order: item.ordem,
          groupId,
          parentQuestionId: item.parent_item_id,
          conditionValue: item.condition_value,
          allowsPhoto: item.permite_foto || false,
          allowsVideo: item.permite_video || false,
          allowsAudio: item.permite_audio || false,
          hasSubChecklist: !!item.sub_checklist_id,
          subChecklistId: item.sub_checklist_id
        };
      });

      // Ordenar grupos
      const sortedGroups = Array.from(groups.values()).sort((a: any, b: any) => a.order - b.order);

      return {
        checklist: checklistResult.data,
        questions: processedQuestions,
        groups: sortedGroups
      };
    },
    enabled: !!checklistId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000, // 10 minutos de cache
  });

  // Função para pré-carregar dados de um checklist
  const prefetchChecklistData = async (id: string) => {
    if (!id) return;
    
    await queryClient.prefetchQuery({
      queryKey: ['optimized-checklist', id],
      queryFn: () => Promise.resolve(null), // Apenas reserva a chave
      staleTime: 5 * 60 * 1000
    });
  };

  return {
    data,
    isLoading,
    error,
    prefetchChecklistData
  };
}
