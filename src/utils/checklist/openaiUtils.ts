
import { handleOpenAIError } from '@/utils/inspection/errorHandling';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Assistant {
  id: string;
  name: string;
  description?: string;
  model?: string;
}

interface ChecklistData {
  title: string;
  description: string;
  category: string;
  company_id?: string;
}

interface GenerateOptions {
  prompt: string;
  checklistData: ChecklistData;
  assistantId?: string;
  questionCount?: number;
}

export async function generateChecklist(options: GenerateOptions) {
  const {
    prompt,
    checklistData,
    assistantId,
    questionCount = 10
  } = options;

  try {
    console.log('Generating checklist with AI:', options);
    
    const { data, error } = await supabase.functions.invoke('generate-checklist', {
      body: {
        prompt,
        checklistData,
        assistantId,
        questionCount
      }
    });

    if (error) {
      console.error('Error in AI generation:', error);
      throw new Error(`Erro na geração por IA: ${error.message}`);
    }

    if (!data || !data.success) {
      console.error('AI generation failed:', data);
      throw new Error(data?.error || 'Falha ao gerar checklist');
    }

    console.log('Successfully generated checklist:', data);
    toast.success('Checklist gerado com sucesso!');
    return data;
  } catch (error: any) {
    console.error('Error in generateChecklist:', error);
    handleOpenAIError(error, 'generateChecklist');
    toast.error(`Erro na geração por IA: ${error.message}`);
    throw error;
  }
}

export async function listAssistants(): Promise<Assistant[]> {
  try {
    // Esta é uma implementação placeholder
    // A implementação real dependeria da configuração da API OpenAI
    console.log('Fetching OpenAI assistants...');
    
    // Retornar array vazio por enquanto
    return [];
  } catch (error: any) {
    handleOpenAIError(error, 'listAssistants');
    throw error;
  }
}
