
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type OpenAIAssistant = {
  id: string;
  name: string;
  description?: string;
  model: string;
  created_at: number;
};

export function useOpenAIAssistants() {
  const [assistants, setAssistants] = useState<OpenAIAssistant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssistants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('list-openai-assistants');

      if (error) {
        console.error('Error fetching OpenAI assistants:', error);
        setError(error.message || 'Failed to fetch assistants');
        toast.error('Erro ao carregar assistentes da OpenAI');
        return;
      }

      if (data && data.data) {
        const assistantsList = data.data as OpenAIAssistant[];
        setAssistants(assistantsList);
        console.log(`Loaded ${assistantsList.length} OpenAI assistants`);
      } else {
        setAssistants([]);
        console.log('No assistants found or empty response');
      }
    } catch (err) {
      console.error('Exception while fetching OpenAI assistants:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Erro ao carregar assistentes da OpenAI');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  return {
    assistants,
    isLoading,
    error,
    refetch: fetchAssistants
  };
}
