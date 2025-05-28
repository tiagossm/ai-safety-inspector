
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubInspectionData {
  id: string;
  questions: any[];
  responses: Record<string, any>;
}

export function useSubInspection(subChecklistId?: string) {
  const [subInspection, setSubInspection] = useState<SubInspectionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (subChecklistId) {
      fetchSubInspection();
    }
  }, [subChecklistId]);

  const fetchSubInspection = async () => {
    if (!subChecklistId) return;

    setIsLoading(true);
    try {
      // Fetch subchecklist data
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklists')
        .select('*')
        .eq('id', subChecklistId)
        .single();

      if (checklistError) throw checklistError;

      // Fetch subchecklist questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('checklist_itens')
        .select('*')
        .eq('checklist_id', subChecklistId)
        .order('ordem');

      if (questionsError) throw questionsError;

      setSubInspection({
        id: subChecklistId,
        questions: questionsData || [],
        responses: {}
      });

    } catch (error: any) {
      console.error('Error fetching sub-inspection:', error);
      toast.error('Erro ao carregar sub-inspeção');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubResponse = (questionId: string, response: any) => {
    setSubInspection(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        responses: {
          ...prev.responses,
          [questionId]: response
        }
      };
    });
  };

  return {
    subInspection,
    isLoading,
    updateSubResponse,
    refetch: fetchSubInspection
  };
}
