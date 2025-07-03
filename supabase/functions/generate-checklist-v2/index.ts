import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders, handleCors, errorResponse, addCorsHeaders } from "../_shared/corsUtils.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // IMPORTANTE: Sempre responder a solicitações OPTIONS com cabeçalhos CORS
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }
  
  try {
    console.log("--- Iniciando solicitação generate-checklist-v2 ---");
    
    // Verificar se a chave OpenAI está configurada
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY não está configurada");
      return errorResponse("API key da OpenAI não configurada no servidor", 500);
    }
    
    const body = await req.json().catch(err => {
      console.error("Erro ao analisar corpo da requisição:", err);
      return null;
    });
    
    if (!body) {
      return errorResponse("Corpo da requisição inválido ou vazio");
    }
    
    console.log("Corpo da requisição:", JSON.stringify(body));
    
    // Extrair os parâmetros da solicitação
    const { 
      title, 
      description, 
      category, 
      companyId,
      questionCount = 10,
      prompt,
      assistantId 
    } = body;

    // Verificações de parâmetros
    if (!prompt && !description) {
      console.error("Descrição ou prompt são necessários");
      return errorResponse("Descrição ou prompt são necessários");
    }
    
    if (!category) {
      console.error("Categoria é obrigatória");
      return errorResponse("Categoria é obrigatória");
    }
    
    if (!companyId) {
      console.error("ID da empresa é obrigatório");
      return errorResponse("ID da empresa é obrigatório");
    }

    console.log("Verificando ID do Assistente OpenAI:", assistantId);

    // Parâmetros para a chamada da OpenAI
    const messages = [
      {
        role: "system",
        content: `Você é um assistente especializado em criar checklists de segurança do trabalho.
        Seu objetivo é criar um checklist para a categoria: ${category}.
        O checklist deve ter aproximadamente ${questionCount} perguntas.
        Para cada pergunta, você deve incluir:
        1. O texto da pergunta
        2. O tipo de resposta (sim/não, múltipla escolha, numérico, texto)
        3. Se a pergunta é obrigatória
        4. Se permite anexar foto ou vídeo`
      },
      {
        role: "user",
        content: prompt || `Crie um checklist para ${category} com a seguinte descrição: ${description}`
      }
    ];

    // Parâmetros do modelo OpenAI
    const openaiParams = {
      model: assistantId ? "gpt-4o-mini" : "gpt-3.5-turbo-0125",
      messages,
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" }
    };

    console.log("Fazendo requisição para OpenAI com parâmetros:", JSON.stringify(openaiParams));
    
    let response;
    
    if (assistantId && assistantId !== "default") {
      console.log("Usando abordagem baseada em threads com ID do Assistente:", assistantId);
      response = await generateWithAssistant(assistantId, prompt || description, category, questionCount);
    } else {
      console.log("Usando API de completion padrão");
      // Chamada padrão da API
      try {
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify(openaiParams),
        });
        
        const apiResponse = await openaiResponse.json();
        console.log("Status da resposta da API:", openaiResponse.status);
        
        if (!openaiResponse.ok) {
          console.error("Erro na API OpenAI:", apiResponse);
          return errorResponse("Erro ao comunicar com OpenAI", openaiResponse.status);
        }
        
        response = JSON.parse(apiResponse.choices[0].message.content);
      } catch (openaiError) {
        console.error("Exceção na chamada OpenAI:", openaiError);
        return errorResponse(`Erro ao processar resposta da OpenAI: ${openaiError.message}`, 500);
      }
    }
    
    // Processa a resposta para estruturar os dados
    const processedResponse = processResponse(response, title, description, category, companyId);
    
    console.log("Resposta processada com sucesso");
    return addCorsHeaders(new Response(
      JSON.stringify({
        success: true,
        ...processedResponse
      }),
      { 
        headers: {
          "Content-Type": "application/json"
        }
      }
    ));
    
  } catch (error) {
    console.error("Erro geral em generate-checklist-v2:", error);
    return errorResponse(error.message || "Erro desconhecido", 500);
  }
});

// Função para processar e estruturar a resposta do modelo
function processResponse(
  response: any,
  title: string,
  description: string,
  category: string,
  companyId: string | null
) {
  console.log("Processing AI response:", JSON.stringify(response).substring(0, 200) + "...");
  
  // Determinamos onde os dados estão na resposta (formatos diferentes podem ser retornados)
  let checklistData = response.checklist || response;
  let questions = checklistData.questions || response.questions || [];
  let groups = checklistData.groups || response.groups || [];
  
  // Se não houver grupos, criamos um padrão
  if (!groups || !Array.isArray(groups) || groups.length === 0) {
    groups = [{
      id: `group-${Date.now()}`,
      title: "Geral",
      order: 0
    }];
  }
  
  // Se não houver perguntas no formato esperado, tentamos extrair do texto
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    console.log("No structured questions found, attempting to parse from response");
    questions = [];
  }
  
  // Garantimos que todas as perguntas tenham groupId
  if (questions.length > 0 && groups.length > 0) {
    questions = questions.map((q, index) => {
      if (!q.groupId) {
        // Associa a pergunta a um grupo baseado na ordem (distribuição simples)
        const groupIndex = Math.floor(index / (questions.length / groups.length));
        return {
          ...q,
          groupId: groups[Math.min(groupIndex, groups.length - 1)].id,
          id: q.id || `question-${Date.now()}-${index}`
        };
      }
      return q;
    });
  }
  
  // Normalizando dados do checklist
  const checklistInfo = {
    title: checklistData.title || title || `Checklist: ${category}`,
    description: checklistData.description || description || `Checklist gerado por IA para ${category}`,
    category,
    company_id: companyId,
    is_template: false,
    status: "active"
  };
  
  console.log(`Processed ${questions.length} questions and ${groups.length} groups`);
  
  return {
    checklistData: checklistInfo,
    questions,
    groups
  };
}

// Função para gerar checklist usando Assistants API
async function generateWithAssistant(
  assistantId: string, 
  prompt: string,
  category: string,
  questionCount: number
): Promise<any> {
  console.log("Generating with assistant:", assistantId);
  
  // Criar uma thread
  const threadResponse = await fetch("https://api.openai.com/v1/threads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({})
  });
  
  if (!threadResponse.ok) {
    const error = await threadResponse.json();
    console.error("Error creating thread:", error);
    throw new Error("Falha ao criar thread para o assistente");
  }
  
  const thread = await threadResponse.json();
  const threadId = thread.id;
  console.log("Created thread with ID:", threadId);
  
  // Adicionar mensagem à thread
  const messageContent = `Por favor, crie um checklist para a categoria: ${category}. 
  O checklist deve ter aproximadamente ${questionCount} perguntas.
  Detalhes adicionais: ${prompt}
  
  Responda com um JSON contendo:
  1. title: título do checklist
  2. description: descrição do checklist
  3. questions: array de perguntas, cada uma com:
     - text: texto da pergunta
     - responseType: tipo de resposta (yes_no, multiple_choice, text, numeric)
     - isRequired: se é obrigatória (true/false)
     - allowsPhoto: se permite foto (true/false)
     - allowsVideo: se permite vídeo (true/false)
     - options: array de opções para perguntas de múltipla escolha
  4. groups: array de grupos, cada um com:
     - id: identificador único
     - title: título do grupo
     - order: ordem do grupo`;
  
  const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      role: "user",
      content: messageContent
    })
  });
  
  if (!messageResponse.ok) {
    const error = await messageResponse.json();
    console.error("Error adding message to thread:", error);
    throw new Error("Falha ao adicionar mensagem à thread");
  }
  console.log("Added message to thread");
  
  // Executar o assistant
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      assistant_id: assistantId,
      model: "gpt-4o-mini"
    })
  });
  
  if (!runResponse.ok) {
    const error = await runResponse.json();
    console.error("Error running assistant:", error);
    throw new Error("Falha ao executar o assistente");
  }
  
  const run = await runResponse.json();
  console.log("Started run with ID:", run.id);
  
  // Aguardar a conclusão do run
  let runStatus = await checkRunStatus(threadId, run.id);
  let attempts = 0;
  const maxAttempts = 30; // aprox. 60 segundos de espera
  
  while (runStatus.status !== "completed" && attempts < maxAttempts) {
    console.log(`Run status: ${runStatus.status}, waiting...`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // aguarda 2 segundos
    runStatus = await checkRunStatus(threadId, run.id);
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    console.error("Timeout waiting for assistant response");
    throw new Error("Tempo esgotado aguardando resposta do assistente");
  }
  
  console.log("Run completed, fetching messages");
  
  // Obter as mensagens da thread
  const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: "GET",
    headers: {
      "OpenAI-Beta": "assistants=v2",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    }
  });
  
  if (!messagesResponse.ok) {
    const error = await messagesResponse.json();
    console.error("Error fetching messages:", error);
    throw new Error("Falha ao recuperar mensagens da thread");
  }
  
  const messages = await messagesResponse.json();
  
  // Processar a última mensagem do assistente
  const assistantMessages = messages.data.filter((msg: any) => msg.role === "assistant");
  if (assistantMessages.length === 0) {
    throw new Error("Nenhuma resposta do assistente encontrada");
  }
  
  const lastMessage = assistantMessages[0];
  console.log("Received assistant response:", lastMessage.content[0].text.value.substring(0, 200) + "...");
  
  // Extrair JSON da resposta
  let jsonContent;
  try {
    const contentText = lastMessage.content[0].text.value;
    const jsonMatch = contentText.match(/```json\n([\s\S]*?)\n```/) || 
                     contentText.match(/```([\s\S]*?)```/) ||
                     [null, contentText];
    
    jsonContent = JSON.parse(jsonMatch[1]);
  } catch (error) {
    console.error("Error parsing JSON from assistant response:", error);
    throw new Error("Falha ao processar resposta do assistente");
  }
  
  return jsonContent;
}

// Função para verificar o status de um run
async function checkRunStatus(threadId: string, runId: string): Promise<any> {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
    method: "GET",
    headers: {
      "OpenAI-Beta": "assistants=v2",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error("Error checking run status:", error);
    throw new Error("Falha ao verificar status da execução");
  }
  
  return await response.json();
}
