
import { supabase } from '@/integrations/supabase/client';

export interface OpenAIAssistant {
  id: string;
  name: string;
  description?: string;
  model?: string;
}

/**
 * Lista todos os assistentes disponíveis da OpenAI
 */
export async function listAssistants(): Promise<OpenAIAssistant[]> {
  try {
    console.log('Chamando função Supabase para listar assistentes...');
    
    const { data, error } = await supabase.functions.invoke('list-openai-assistants', {
      method: 'GET'
    });
    
    if (error) {
      console.error('Erro ao chamar função list-openai-assistants:', error);
      throw new Error(`Erro ao buscar assistentes: ${error.message}`);
    }
    
    if (!data || !Array.isArray(data.assistants)) {
      console.warn('Nenhum assistente retornado ou formato inválido:', data);
      return [];
    }
    
    console.log(`Assistentes carregados com sucesso: ${data.assistants.length} encontrados`);
    
    // Mapear os assistentes para a interface esperada
    return data.assistants.map((assistant: any) => ({
      id: assistant.id,
      name: assistant.name || 'Assistente sem nome',
      description: assistant.description || undefined,
      model: assistant.model || undefined
    }));
    
  } catch (error) {
    console.error('Erro na função listAssistants:', error);
    throw error;
  }
}

/**
 * Gera um checklist usando IA com um assistente específico
 */
export async function generateChecklistWithAI(params: {
  prompt: string;
  assistantId: string;
  numQuestions?: number;
  companyData?: any;
  category?: string;
}): Promise<{ questions: any[] }> {
  try {
    console.log('Gerando checklist com IA...', { 
      assistantId: params.assistantId, 
      numQuestions: params.numQuestions 
    });
    
    const { data, error } = await supabase.functions.invoke('generate-checklist-v2', {
      body: {
        prompt: params.prompt,
        assistantId: params.assistantId,
        numQuestions: params.numQuestions || 10,
        companyData: params.companyData,
        category: params.category
      }
    });
    
    if (error) {
      console.error('Erro ao gerar checklist:', error);
      throw new Error(`Erro ao gerar checklist: ${error.message}`);
    }
    
    if (!data || !Array.isArray(data.questions)) {
      console.error('Resposta inválida da IA:', data);
      throw new Error('Resposta inválida da IA');
    }
    
    console.log(`Checklist gerado com sucesso: ${data.questions.length} perguntas`);
    
    return {
      questions: data.questions
    };
    
  } catch (error) {
    console.error('Erro na função generateChecklistWithAI:', error);
    throw error;
  }
}

/**
 * Verifica se a configuração da OpenAI está válida
 */
export async function checkOpenAIConfig(): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('check-openai-config');
    
    if (error) {
      console.error('Erro ao verificar configuração OpenAI:', error);
      return false;
    }
    
    return data?.isConfigured || false;
  } catch (error) {
    console.error('Erro na função checkOpenAIConfig:', error);
    return false;
  }
}
