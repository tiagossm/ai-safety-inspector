
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface Assistant {
  id: string;
  name: string;
}

export const useOpenAIAssistants = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadAssistants = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('list-assistants');
      console.log('Raw response from list-assistants:', response);

      if (response.error) {
        throw new Error(response.error.message || 'Failed to load assistants');
      }

      // Simplificando o acesso aos dados
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
          name: assistant.name || 'Untitled Assistant'
        }))
        .filter(assistant => assistant.id);

      console.log('Formatted assistants:', formattedAssistants);
      setAssistants(formattedAssistants);

    } catch (error: any) {
      console.error('Error loading assistants:', error);
      toast({
        title: "Erro ao carregar assistentes",
        description: error.message || "Verifique se a chave da API da OpenAI está configurada corretamente.",
        variant: "destructive"
      });
      setAssistants([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    assistants,
    loading,
    loadAssistants
  };
};
