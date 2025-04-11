import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChecklistWithStats } from '@/types/newChecklist';

export function useChecklistFetch(filters?: any) {
  const [data, setData] = useState<ChecklistWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: checklistData, error: checklistError } = await supabase
          .from('checklists')
          .select(`
            *,
            companies(*),
            users:responsible_id(*)
          `);

        if (checklistError) {
          throw checklistError;
        }

        if (checklistData) {
          const transformedData = checklistData.map(transformResponseToChecklistWithStats);
          setData(transformedData);
        } else {
          setData([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchChecklists();
  }, [filters]);

  const transformResponseToChecklistWithStats = (item: any): ChecklistWithStats => {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      isTemplate: item.is_template,
      is_template: item.is_template,  // Add this property to match required type
      status: item.status as "active" | "inactive",
      category: item.category,
      responsibleId: item.responsible_id,
      companyId: item.company_id,
      userId: item.user_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      dueDate: item.due_date,
      totalQuestions: item.total_questions || 0, 
      completedQuestions: 0
    };
  };

  return { data, loading, error };
}
