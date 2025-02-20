
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
      const { data, error } = await supabase.functions.invoke('list-assistants');
      
      if (error) throw error;

      // Transform the response to match our interface
      const formattedAssistants = data.data.map((assistant: any) => ({
        id: assistant.id,
        name: assistant.name
      }));

      setAssistants(formattedAssistants);
      console.log('Assistants loaded successfully:', formattedAssistants);

    } catch (error) {
      console.error('Error loading assistants:', error);
      toast({
        title: "Erro ao carregar assistentes",
        description: "Verifique se a chave da API da OpenAI está configurada corretamente.",
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
