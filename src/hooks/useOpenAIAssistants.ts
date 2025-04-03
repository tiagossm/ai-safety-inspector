
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Assistant {
  id: string;
  name: string;
  description?: string;
  model?: string;
  created_at?: string;
}

export const useOpenAIAssistants = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssistants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching OpenAI assistants...');
      const response = await supabase.functions.invoke('list-assistants');
      console.log('Response from list-assistants:', response);

      if (response.error) {
        throw new Error(response.error.message || 'Failed to load assistants');
      }

      const assistantsList = response.data?.assistants || [];

      if (!Array.isArray(assistantsList)) {
        console.warn('Invalid assistants format received', assistantsList);
        throw new Error('Formato de assistentes inválido');
      }

      const formattedAssistants = assistantsList
        .filter((assistant) => assistant && typeof assistant === 'object')
        .map((assistant) => ({
          id: assistant.id || '',
          name: assistant.name || 'Assistente sem nome',
          description: assistant.description || '',
          model: assistant.model || '',
          created_at: assistant.created_at
            ? new Date(assistant.created_at * 1000).toLocaleDateString()
            : ''
        }))
        .filter((assistant) => assistant.id)
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(`Retrieved ${formattedAssistants.length} OpenAI assistants`);
      setAssistants(formattedAssistants);
    } catch (error: any) {
      console.error('Error loading assistants:', error);
      setError(error.message || 'Erro ao carregar assistentes');
      toast.error(
        'Erro ao carregar assistentes. Verifique se a chave da API da OpenAI está configurada corretamente.'
      );
      setAssistants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssistants();
  }, [loadAssistants]);

  const refreshAssistants = () => {
    loadAssistants();
  };

  return {
    assistants,
    loading,
    error,
    refreshAssistants
  };
};
