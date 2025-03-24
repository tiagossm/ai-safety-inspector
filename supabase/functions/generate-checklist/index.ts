
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    const { prompt, questionCount = 5, assistant = 'general', checklistData = {}, assistantId } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    let systemMessage = '';
    switch (assistant) {
      case 'workplace-safety':
        systemMessage = 'Você é um especialista em segurança do trabalho. Crie um checklist para inspeções e auditorias de segurança.';
        break;
      case 'compliance':
        systemMessage = 'Você é um especialista em conformidade e regulamentações. Crie um checklist para auditorias de conformidade.';
        break;
      case 'quality':
        systemMessage = 'Você é um especialista em controle de qualidade. Crie um checklist para inspeções e auditorias de qualidade.';
        break;
      default:
        systemMessage = 'Você é um especialista em criação de checklists para diversos fins. Crie um checklist detalhado e abrangente.';
    }

    systemMessage += `
Crie um checklist com ${questionCount} perguntas com base no prompt do usuário.
Responda APENAS no formato JSON abaixo, sem texto adicional:

{
  "title": "Título do checklist (extraído do prompt)",
  "description": "Breve descrição do propósito do checklist",
  "questions": [
    {
      "text": "Texto da pergunta 1",
      "type": "sim/não | seleção múltipla | texto | numérico | foto | assinatura",
      "required": true | false,
      "options": ["Opção 1", "Opção 2"] (apenas para seleção múltipla),
      "group": "Nome do grupo a que esta pergunta pertence (opcional)"
    }
  ],
  "groups": [
    {
      "name": "Nome do grupo 1",
      "description": "Descrição do grupo (opcional)"
    }
  ]
}`;

    console.log("System message:", systemMessage);
    console.log("User prompt:", prompt);

    let response;

    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let generatedContent;

    try {
      const content = data.choices[0].message.content;
      console.log("Raw AI response:", content);
      generatedContent = JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to parse AI response as JSON.",
        checklistData: {
          title: checklistData.title || "Checklist gerado por IA",
          description: "Houve um erro ao gerar o conteúdo."
        },
        questions: [],
        groups: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    const title = generatedContent.title || checklistData.title || "Checklist gerado por IA";
    const description = generatedContent.description || `Checklist gerado com base no prompt: ${prompt}`;
    const questions = generatedContent.questions || [];
    const groupsFromResponse = generatedContent.groups || [];
    const groupMap = new Map();

    const groups = groupsFromResponse.map((group: any, index: number) => {
      const groupId = `group-${index + 1}`;
      groupMap.set(group.name, groupId);
      return {
        id: groupId,
        title: group.name,
        description: group.description || "",
        order: index
      };
    });

    function mapTipoResposta(tipo: string): string {
      // Updated to ensure the exact DB-compatible values are used
      const map: Record<string, string> = {
        "yes_no": "sim/não",
        "sim_nao": "sim/não",
        "sim/não": "sim/não",
        "text": "texto",
        "texto": "texto",
        "multiple_choice": "seleção múltipla",
        "seleção múltipla": "seleção múltipla",
        "numeric": "numérico",
        "numérico": "numérico",
        "photo": "foto",
        "foto": "foto",
        "signature": "assinatura",
        "assinatura": "assinatura"
      };
      
      // Log the mapping for debugging
      console.log(`Mapping response type: ${tipo} -> ${map[tipo.toLowerCase()] || "texto"}`);
      return map[tipo.toLowerCase()] || "texto"; // Default to texto if unknown
    }

    const processedQuestions = questions.map((q: any, index: number) => {
      let groupId = undefined;
      if (q.group && groupMap.has(q.group)) {
        groupId = groupMap.get(q.group);
      }

      let options: string[] = [];
      if (q.type === 'multiple_choice' || q.type === 'seleção múltipla') {
        options = Array.isArray(q.options) && q.options.length > 0
          ? q.options
          : ["Opção 1", "Opção 2", "Opção 3"];
      }

      const responseType = mapTipoResposta(q.type);

      return {
        id: `ai-${Date.now()}-${index}`,
        text: q.text,
        responseType: responseType,
        isRequired: q.required !== undefined ? q.required : true,
        options: options,
        groupId: groupId,
        weight: 1,
        allowsPhoto: false,
        allowsVideo: false,
        allowsAudio: false,
        order: index
      };
    });

    return new Response(JSON.stringify({
      success: true,
      checklistData: {
        ...checklistData,
        title,
        description,
      },
      questions: processedQuestions,
      groups
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error generating checklist:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
      checklistData: {
        title: "Erro na geração",
        description: "Houve um erro ao gerar o conteúdo."
      },
      questions: [],
      groups: []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
