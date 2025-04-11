import { useState } from "react";
import { toast } from "sonner";
import { NewChecklistPayload } from "@/types/newChecklist";
import { supabase } from "@/integrations/supabase/client";

const systemPrompt = `Você é um especialista em criar checklists. Seu objetivo é criar checklists claras, concisas e completas sobre um determinado tópico.
As checklists devem ser fáceis de usar e seguir, e devem garantir que todas as etapas importantes sejam cobertas.
As perguntas devem ser claras e objetivas, evitando ambiguidades.
O formato de resposta deve ser adequado para cada pergunta, utilizando "sim/não" quando apropriado, "texto" para respostas abertas, "numérico" para valores numéricos e "múltipla escolha" quando necessário.
As opções de múltipla escolha devem ser relevantes e mutuamente exclusivas.
A checklist deve ser organizada de forma lógica, com uma sequência de perguntas que faça sentido para o usuário.
Seja conciso e direto, sem informações desnecessárias.
Mantenha um tom profissional e objetivo.
O resultado deve ser um array de objetos JSON, onde cada objeto representa uma pergunta da checklist.
Cada objeto deve ter os seguintes campos: "text" (texto da pergunta), "type" (tipo de resposta: "sim/não", "texto", "numérico", "múltipla escolha"), "required" (booleano indicando se a pergunta é obrigatória), "options" (array de strings com as opções de múltipla escolha, se aplicável), "hint" (dica ou instrução adicional, se necessário), "weight" (peso da pergunta na avaliação geral).`;

const makeOpenAIRequest = async (prompt: string, checklistData: NewChecklistPayload, numberOfQuestions: number) => {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const apiURL = 'https://api.openai.com/v1/chat/completions';

  if (!apiKey) {
    throw new Error("Chave da API do OpenAI não encontrada");
  }
  
  const requestData = {
    model: "gpt-3.5-turbo-16k",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `${prompt}\nCreate a checklist with around ${numberOfQuestions} questions about this topic. 
                 The checklist is for company ID ${checklistData.company_id || 'unknown'}.`
      }
    ],
    temperature: 0.7,
    max_tokens: 4000
  };

  try {
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      console.error("Erro na resposta da OpenAI:", response.status, response.statusText);
      throw new Error(`Erro na requisição para OpenAI: ${response.status} - ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    
    if (!jsonResponse.choices || jsonResponse.choices.length === 0) {
      throw new Error("Resposta da OpenAI sem escolhas");
    }

    const aiOutput = jsonResponse.choices[0].message.content;
    return aiOutput;
  } catch (error) {
    console.error("Erro ao se comunicar com a OpenAI:", error);
    throw error;
  }
};

const handleGenerateWithClaude = async (prompt: string, checklistData: NewChecklistPayload, numberOfQuestions: number) => {
  const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
  const apiURL = 'https://api.anthropic.com/v1/messages';

  if (!apiKey) {
    throw new Error("Chave da API da Anthropic não encontrada");
  }
  
  const requestBody = {
    model: "claude-2",
    temperature: 0.7,
    max_tokens_to_sample: 4000,
    prompt: `${systemPrompt}\n\nHuman: ${prompt}\nCreate a checklist with around ${numberOfQuestions} questions about this topic. 
             The checklist is for company ID ${checklistData.company_id || 'unknown'}.`
  };

  try {
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error("Erro na resposta da Anthropic:", response.status, response.statusText);
      throw new Error(`Erro na requisição para Anthropic: ${response.status} - ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse.content[0].text;
  } catch (error) {
    console.error("Erro ao se comunicar com a Anthropic:", error);
    throw error;
  }
};

export function useChecklistAI() {
  const [isLoading, setIsLoading] = useState(false);

  const generateChecklist = async (
    aiPrompt: string,
    checklistData: NewChecklistPayload,
    openAIAssistant?: string,
    numQuestions: number = 10
  ): Promise<any> => {
    setIsLoading(true);
    try {
      let aiOutput: string;
      
      if (openAIAssistant === "claude") {
        aiOutput = await handleGenerateWithClaude(aiPrompt, checklistData, numQuestions);
      } else {
        aiOutput = await makeOpenAIRequest(aiPrompt, checklistData, numQuestions);
      }

      if (!aiOutput) {
        throw new Error("Nenhuma resposta da IA");
      }

      try {
        const parsedOutput = JSON.parse(aiOutput);
        return parsedOutput;
      } catch (parseError) {
        console.error("Erro ao analisar a resposta da IA:", parseError);
        console.log("Output da IA:", aiOutput);
        throw new Error("Erro ao analisar a resposta da IA. Verifique o console para mais detalhes.");
      }
    } catch (error: any) {
      console.error('Erro na geração por IA:', error);
      toast.error(`Erro na geração por IA: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    generateChecklist
  };
}
