import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleOpenAIError } from "@/utils/inspection/errorHandling";

/**
 * Interface para dados do checklist
 */
interface ChecklistData {
  title: string;
  description: string;
  category: string;
  company_id?: string;
}

/**
 * Interface para opções de geração
 */
interface GenerateOptions {
  prompt: string;
  checklistData: ChecklistData;
  assistantId?: string;
  questionCount?: number;
  maxRetries?: number;
}

/**
 * Função para gerar checklist usando a API da OpenAI
 * @param options Opções de geração
 * @returns Dados do checklist gerado
 */
export async function generateChecklist(options: GenerateOptions) {
  const {
    prompt,
    checklistData,
    assistantId,
    questionCount = 10,
    maxRetries = 2
  } = options;

  let retries = 0;
  let lastError = null;

  // Tentar gerar o checklist com retentativas
  while (retries <= maxRetries) {
    try {
      // Mostrar toast de carregamento apenas na primeira tentativa
      if (retries === 0) {
        toast.loading("Gerando checklist com IA...");
      } else {
        console.log(`Tentativa ${retries} de ${maxRetries} para gerar checklist`);
      }

      // Chamar a função Edge do Supabase
      const { data, error } = await supabase.functions.invoke('generate-checklist', {
        body: {
          prompt,
          checklistData,
          assistantId,
          questionCount
        }
      });

      // Se houver erro, lançar exceção
      if (error) throw error;

      // Verificar se a resposta é válida
      if (data?.questions && Array.isArray(data.questions)) {
        toast.dismiss();
        toast.success(`${data.questions.length} perguntas geradas pela IA`);
        return data;
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Resposta inesperada da função generate-checklist.");
      }
    } catch (error: any) {
      lastError = error;
      console.error(`Erro na geração por IA (tentativa ${retries + 1}):`, error);

      // Se for o último retry, mostrar erro
      if (retries === maxRetries) {
        toast.dismiss();
        handleOpenAIError(error, "generateChecklist");
      }

      retries++;
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  throw lastError || new Error("Falha ao gerar checklist após múltiplas tentativas");
}

/**
 * Função para listar assistentes disponíveis
 * @returns Lista de assistentes
 */
export async function listAssistants() {
  try {
    const { data, error } = await supabase.functions.invoke('list-assistants');

    if (error) throw error;

    if (data && data.assistants) {
      return data.assistants;
    } else {
      throw new Error('No assistants data returned');
    }
  } catch (error: any) {
    handleOpenAIError(error, "listAssistants");
    return [];
  }
}

/**
 * Função para verificar se a API da OpenAI está configurada
 * @returns true se a API estiver configurada
 */
export async function checkOpenAIConfig() {
  try {
    const { data, error } = await supabase.functions.invoke('check-openai-config');

    if (error) throw error;

    return data?.configured === true;
  } catch (error: any) {
    console.error("Erro ao verificar configuração da OpenAI:", error);
    return false;
  }
}

