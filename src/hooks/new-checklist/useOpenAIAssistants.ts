
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OpenAIAssistant {
  id: string;
  name: string;
  description: string;
  model: string;
  instructions: string;
  tools: any[];
  metadata: Record<string, any>;
  created_at: number;
}

export function useOpenAIAssistants() {
  const [assistants, setAssistants] = useState<OpenAIAssistant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssistants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('list-openai-assistants');

      if (error) {
        throw new Error(error.message || 'Erro ao buscar assistentes');
      }

      if (data?.assistants) {
        setAssistants(data.assistants);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido ao carregar assistentes';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const createAssistant = async (assistantData: {
    name: string;
    description: string;
    instructions: string;
    model?: string;
    tools?: any[];
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-openai-assistant', {
        body: {
          name: assistantData.name,
          description: assistantData.description,
          instructions: assistantData.instructions,
          model: assistantData.model || 'gpt-4o-mini',
          tools: assistantData.tools || []
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao criar assistente');
      }

      if (data?.assistant) {
        setAssistants(prev => [...prev, data.assistant]);
        toast.success('Assistente criado com sucesso!');
        return data.assistant;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido ao criar assistente';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAssistant = async (assistantId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.functions.invoke('delete-openai-assistant', {
        body: { assistantId }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao deletar assistente');
      }

      setAssistants(prev => prev.filter(a => a.id !== assistantId));
      toast.success('Assistente deletado com sucesso!');
    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido ao deletar assistente';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
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
    fetchAssistants,
    createAssistant,
    deleteAssistant,
    refetch: fetchAssistants
  };
}
