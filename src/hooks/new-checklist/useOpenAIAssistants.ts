
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Assistant {
  id: string;
  name: string;
  description?: string;
  model?: string;
  created_at?: string;
}

export function useOpenAIAssistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssistants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Define mock data to use as fallback
      const mockAssistants: Assistant[] = [
        {
          id: "asst_mock_1",
          name: "Assistente de Segurança do Trabalho",
          model: "gpt-4",
          description: "Especializado em normas de segurança",
          created_at: Date.now().toString()
        },
        {
          id: "asst_mock_2",
          name: "Assistente de Qualidade",
          model: "gpt-4",
          description: "Especializado em ISO 9001",
          created_at: Date.now().toString()
        }
      ];
      
      try {
        console.log("Fetching OpenAI assistants...");
        
        // Call the Supabase Edge Function with proper error handling
        const { data, error } = await supabase.functions.invoke('list-openai-assistants', {
          method: 'GET'
        });
        
        if (error) {
          console.error('Error calling list-openai-assistants function:', error);
          setError('Erro ao buscar assistentes da OpenAI: ' + error.message);
          // Fall back to mock data on error
          console.log("Falling back to mock assistants data");
          setAssistants(mockAssistants);
          return;
        }
        
        if (!data || !Array.isArray(data.assistants)) {
          console.error('Invalid response from list-openai-assistants:', data);
          setError('Resposta inválida ao buscar assistentes');
          // Fall back to mock data on invalid response
          console.log("Falling back to mock assistants data due to invalid response");
          setAssistants(mockAssistants);
          return;
        }
        
        console.log(`Retrieved ${data.assistants.length} OpenAI assistants`);
        setAssistants(data.assistants);
      } catch (err: any) {
        console.error('Error in useOpenAIAssistants:', err);
        setError('Erro ao buscar assistentes: ' + (err.message || 'Erro desconhecido'));
        // Fall back to mock data on any error
        console.log("Falling back to mock assistants data due to exception");
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
