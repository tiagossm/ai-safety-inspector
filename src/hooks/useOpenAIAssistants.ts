
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
      console.log('Fetching assistants...');
      const { data, error } = await supabase.functions.invoke('list-assistants');
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Response from list-assistants:', data);

      // Ensure we have an array to work with
      const assistantsList = Array.isArray(data?.data) ? data.data : [];
      
      // Transform the response to match our interface
      const formattedAssistants = assistantsList.map((assistant: any) => ({
        id: assistant.id || '',
        name: assistant.name || 'Untitled Assistant'
      })).filter(assistant => assistant.id); // Only keep assistants with valid IDs

      setAssistants(formattedAssistants);
      console.log('Assistants loaded successfully:', formattedAssistants);

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
