
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
      // Call the edge function to list assistants
      const response = await supabase.functions.invoke('list-assistants');
      console.log('Response from list-assistants:', response);

      if (response.error) {
        throw new Error(response.error.message || 'Failed to load assistants');
      }

      // Process and format the assistants data
      const assistantsList = response.data?.data || [];
      console.log('Assistants list:', assistantsList);

      if (!Array.isArray(assistantsList)) {
        console.log('Response is not an array:', assistantsList);
        setAssistants([]);
        return;
      }

      const formattedAssistants = assistantsList
        .filter(assistant => assistant && typeof assistant === 'object')
        .map(assistant => ({
          id: assistant.id || '',
          name: assistant.name || 'Assistente sem nome',
          description: assistant.description || '',
          model: assistant.model || '',
          created_at: assistant.created_at ? new Date(assistant.created_at * 1000).toLocaleDateString() : ''
        }))
        .filter(assistant => assistant.id)
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

      console.log('Formatted assistants:', formattedAssistants);
      setAssistants(formattedAssistants);

    } catch (error: any) {
      console.error('Error loading assistants:', error);
      setError(error.message || 'Erro ao carregar assistentes');
      toast.error("Erro ao carregar assistentes. Verifique se a chave da API da OpenAI está configurada corretamente.");
      setAssistants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssistants();
  }, [loadAssistants]);

  // Refresh assistants function that can be called from components
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
