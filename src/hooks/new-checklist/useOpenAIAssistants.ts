import { useState, useEffect } from 'react';
import { listAssistants } from '@/utils/checklist/openaiUtils';

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
      const assistantsData = await listAssistants();
      
      if (assistantsData && assistantsData.length > 0) {
        console.log(`Retrieved ${assistantsData.length} OpenAI assistants`);
        setAssistants(assistantsData);
      } else {
        setError('No assistants available');
        console.error('No assistants data returned');
      }
    } catch (err: any) {
      console.error('Unexpected error fetching assistants:', err);
      setError(`Unexpected error: ${err.message || 'Unknown error'}`);
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
