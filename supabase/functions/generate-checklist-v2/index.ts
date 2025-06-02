
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("--- Iniciando solicitação generate-checklist-v2 ---");
    
    const body = await req.json();
    console.log("Corpo da requisição:", JSON.stringify(body));
    
    const { title, description, category, companyId, questionCount = 5, prompt, assistantId } = body;

    if (!category) {
      throw new Error('Categoria é obrigatória');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let companyInfo = "";
    if (companyId) {
      const { data: company } = await supabase
        .from('companies')
        .select('fantasy_name, cnpj, cnae, employee_count')
        .eq('id', companyId)
        .single();
      
      if (company) {
        const { data: riskData } = await supabase
          .from('nr4_riscos')
          .select('grau_risco')
          .eq('cnae', company.cnae)
          .single();
        
        companyInfo = `Empresa: ${company.fantasy_name} (CNPJ ${company.cnpj}, CNAE ${company.cnae}, Grau de Risco ${riskData?.grau_risco || 'não informado'}, Funcionários: ${company.employee_count || 'não informado'})`;
      }
    }

    const finalPrompt = prompt || `Categoria: ${category}\n${companyInfo}\nDescrição: ${description}\nContexto: ${body.context || ''}`;

    let result;

    if (assistantId) {
      console.log("Verificando ID do Assistente OpenAI:", assistantId);
      result = await generateWithAssistant(openaiApiKey, assistantId, category, questionCount, finalPrompt);
    } else {
      console.log("Fazendo requisição para OpenAI com parâmetros:", JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
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
            content: finalPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      }));

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
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
              content: finalPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2500,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      result = data.choices[0].message.content;
    }

    console.log("Processing AI response:", result.substring(0, 200) + "...");

    const aiResponse = JSON.parse(result);
    console.log("Received assistant response:", JSON.stringify(aiResponse).substring(0, 200) + "...");

    // Mapeamento padronizado de tipos de resposta
    function normalizeResponseType(rawType: string): string {
      const normalizedType = rawType.toLowerCase().trim();
      
      const typeMapping: Record<string, string> = {
        'yes_no': 'yes_no',
        'sim/não': 'yes_no',
        'sim/nao': 'yes_no',
        'boolean': 'yes_no',
        'bool': 'yes_no',
        
        'text': 'text',
        'texto': 'text',
        'string': 'text',
        
        'paragraph': 'paragraph',
        'parágrafo': 'paragraph',
        'paragrafo': 'paragraph',
        'texto longo': 'paragraph',
        
        'numeric': 'numeric',
        'numérico': 'numeric',
        'numero': 'numeric',
        'number': 'numeric',
        
        'multiple_choice': 'multiple_choice',
        'seleção múltipla': 'multiple_choice',
        'selecao multipla': 'multiple_choice',
        'múltipla escolha': 'multiple_choice',
        'multipla escolha': 'multiple_choice',
        'choice': 'multiple_choice',
        
        'checkboxes': 'checkboxes',
        'caixas de seleção': 'checkboxes',
        'caixas de selecao': 'checkboxes',
        'checkbox': 'checkboxes',
        
        'dropdown': 'dropdown',
        'lista suspensa': 'dropdown',
        'select': 'dropdown',
        
        'photo': 'photo',
        'foto': 'photo',
        'image': 'photo',
        'imagem': 'photo',
        
        'signature': 'signature',
        'assinatura': 'signature',
        'sign': 'signature',
        
        'date': 'date',
        'data': 'date',
        
        'time': 'time',
        'hora': 'time',
        'horario': 'time',
        'horário': 'time',
        
        'datetime': 'datetime',
        'data e hora': 'datetime',
        'data_hora': 'datetime'
      };
      
      return typeMapping[normalizedType] || 'text';
    }

    // Processar perguntas com mapeamento correto
    const processedQuestions = (aiResponse.questions || []).map((q: any, index: number) => {
      const rawResponseType = q.responseType || q.tipo_resposta || 'yes_no';
      const normalizedResponseType = normalizeResponseType(rawResponseType);
      
      return {
        id: `ai-${Date.now()}-${index}`,
        text: q.text || q.pergunta || `Pergunta ${index + 1}`,
        responseType: normalizedResponseType,
        isRequired: q.isRequired !== false,
        weight: q.weight || 1,
        allowsPhoto: q.allowsPhoto || false,
        allowsVideo: q.allowsVideo || false,
        allowsAudio: q.allowsAudio || false,
        allowsFiles: q.allowsFiles || false,
        order: index,
        options: q.options || null,
        groupId: "group-1"
      };
    });

    // Processar grupos
    const processedGroups = aiResponse.groups || [
      {
        id: "group-1",
        title: "Geral",
        order: 0
      }
    ];

    console.log(`Processed ${processedQuestions.length} questions and ${processedGroups.length} groups`);
    console.log("Response types:", processedQuestions.map(q => `${q.text}: ${q.responseType}`));
    console.log("Resposta processada com sucesso");

    return new Response(
      JSON.stringify({
        success: true,
        questions: processedQuestions,
        groups: processedGroups,
        checklistData: {
          title: aiResponse.title || title || `Checklist - ${category}`,
          description: aiResponse.description || description || `Checklist gerado para ${category}`,
          is_template: aiResponse.is_template || false
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-checklist-v2:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateWithAssistant(apiKey: string, assistantId: string, category: string, questionCount: number, prompt: string) {
  console.log("Usando abordagem baseada em threads com ID do Assistente:", assistantId);
  console.log("Generating with assistant:", assistantId);

  const thread = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({})
  });

  const threadData = await thread.json();
  console.log("Created thread with ID:", threadData.id);

  await fetch(`https://api.openai.com/v1/threads/${threadData.id}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      role: 'user',
      content: prompt
    })
  });

  console.log("Added message to thread");

  const run = await fetch(`https://api.openai.com/v1/threads/${threadData.id}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({
      assistant_id: assistantId
    })
  });

  const runData = await run.json();
  console.log("Started run with ID:", runData.id);

  let runStatus = runData.status;
  while (runStatus === 'queued' || runStatus === 'in_progress') {
    console.log(`Run status: ${runStatus}, waiting...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadData.id}/runs/${runData.id}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });
    
    const statusData = await statusResponse.json();
    runStatus = statusData.status;
  }

  console.log("Run completed, fetching messages");

  const messages = await fetch(`https://api.openai.com/v1/threads/${threadData.id}/messages`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  const messagesData = await messages.json();
  const assistantMessage = messagesData.data.find((msg: any) => msg.role === 'assistant');
  
  return assistantMessage.content[0].text.value;
}
