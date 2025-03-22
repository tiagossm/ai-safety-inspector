
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
      // Mock data for assistants if the API call fails
      // This ensures the UI works even when the OpenAI API is unavailable
      const mockAssistants: Assistant[] = [
        {
          id: "asst_mock_1",
          name: "Assistente de Segurança do Trabalho",
          model: "gpt-4",
          description: "Especializado em normas de segurança",
          created_at: Date.now()
        },
        {
          id: "asst_mock_2",
          name: "Assistente de Qualidade",
          model: "gpt-4",
          description: "Especializado em ISO 9001",
          created_at: Date.now()
        }
      ];
      
      try {
        const { data, error } = await supabase.functions.invoke('list-openai-assistants');
        
        if (error) {
          console.error('Error fetching OpenAI assistants:', error);
          setError('Erro ao buscar assistentes da OpenAI: ' + error.message);
          // Fall back to mock data
          setAssistants(mockAssistants);
          return;
        }
        
        setAssistants(data.assistants || []);
      } catch (err: any) {
        console.error('Error in useOpenAIAssistants:', err);
        setError('Erro ao buscar assistentes: ' + (err.message || 'Erro desconhecido'));
        // Fall back to mock data
        setAssistants(mockAssistants);
      }
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
