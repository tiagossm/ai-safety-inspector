
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Assistant {
  id: string;
  name: string;
  description?: string;
  model?: string;
}

/**
 * Hook for fetching OpenAI assistants
 */
export function useOpenAIAssistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssistants = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching OpenAI assistants...');
      const { data, error } = await supabase.functions.invoke('list-assistants');
      
      if (error) {
        console.error('Error fetching assistants:', error);
        setError(`Error fetching assistants: ${error.message}`);
        return;
      }
      
      console.log('Response from list-assistants:', data);
      
      if (data && data.assistants) {
        console.log(`Retrieved ${data.assistants.length} OpenAI assistants`);
        setAssistants(data.assistants);
      } else {
        setError('No assistants data returned');
        console.error('No assistants data in response:', data);
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
    refetch: fetchAssistants 
  };
}

export default useOpenAIAssistants;
