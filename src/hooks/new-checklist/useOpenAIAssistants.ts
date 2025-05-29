import { useState, useEffect, useRef } from 'react';
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
  
  const hasFetched = useRef(false); // variável de controle

  const fetchAssistants = async () => {
    if (hasFetched.current) return; // Evita dupla requisição
    hasFetched.current = true;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching OpenAI assistants...');
      const response = await listAssistants();

      const assistantsData: Assistant[] = Array.isArray(response)
        ? response
        : Array.isArray(response.assistants)
        ? response.assistants
        : [];

      setAssistants(assistantsData);
    } catch (err: any) {
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
