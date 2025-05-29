import { useState, useEffect } from 'react';
import { listAssistants } from '@/utils/checklist/openaiUtils';
import { handleOpenAIError } from '@/utils/inspection/errorHandling';

interface Assistant {
  id: string;
  name: string;
  description?: string;
  model?: string;
}

export function useOpenAIAssistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssistants = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching OpenAI assistants...');
      const response = await listAssistants();

      // Log da resposta para diagnóstico
      console.log('Assistants data received:', response);

      // Tratamento robusto da resposta considerando possíveis formatos
      const assistantsData: Assistant[] = Array.isArray(response)
        ? response
        : Array.isArray(response.assistants)
        ? response.assistants
        : [];

      if (assistantsData.length > 0) {
        console.log(`Retrieved ${assistantsData.length} OpenAI assistants`);
        setAssistants(assistantsData);
      } else {
        console.warn('No assistants data returned or empty array');
        setAssistants([]);
      }
    } catch (err: any) {
      console.error('Error fetching assistants:', err);
      handleOpenAIError(err, 'useOpenAIAssistants');
      setError(err.message || 'Erro ao carregar assistentes');
      setAssistants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  return {
    assistants,
    loading,
    error,
    refetch: fetchAssistants,
  };
}

export default useOpenAIAssistants;
