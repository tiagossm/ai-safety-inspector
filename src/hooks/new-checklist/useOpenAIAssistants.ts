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
      const assistantsData = await listAssistants();
      
      if (assistantsData && assistantsData.length > 0) {
        console.log(`Retrieved ${assistantsData.length} OpenAI assistants`);
        setAssistants(assistantsData);
      } else {
        console.warn('No assistants data returned or empty array');
        setAssistants([]);
        // Não definimos um erro aqui, apenas um array vazio
        // Isso evita mostrar uma mensagem de erro quando não há assistentes
      }
    } catch (err: any) {
      console.error('Error fetching assistants:', err);
      
      // Usar o handler de erros da OpenAI para tratar o erro de forma consistente
      handleOpenAIError(err, 'useOpenAIAssistants');
      
      // Definir a mensagem de erro para exibição na UI
      setError(err.message || 'Erro ao carregar assistentes');
      
      // Garantir que assistants seja um array vazio em caso de erro
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

