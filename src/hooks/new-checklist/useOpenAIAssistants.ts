
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Assistant {
  id: string;
  name: string;
  model?: string;
  description?: string;
  created_at: number;
}

export function useOpenAIAssistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssistants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('list-openai-assistants');
      
      if (error) {
        console.error('Error fetching OpenAI assistants:', error);
        setError('Erro ao buscar assistentes da OpenAI: ' + error.message);
        return;
      }
      
      setAssistants(data.assistants || []);
    } catch (err: any) {
      console.error('Error in useOpenAIAssistants:', err);
      setError('Erro ao buscar assistentes: ' + (err.message || 'Erro desconhecido'));
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
