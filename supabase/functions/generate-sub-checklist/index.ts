
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
      throw new Error('OPENAI_API_KEY não está configurada nas variáveis de ambiente');
    }

    const { prompt, parentQuestionId, parentQuestionText, questionCount = 3 } = await req.json();

    if (!prompt) {
      throw new Error('O prompt é obrigatório');
    }

    if (!parentQuestionId) {
      throw new Error('O ID da pergunta principal é obrigatório');
    }

    // A requested count between 2-5 makes sense for sub-checklists
    const actualQuestionCount = Math.min(Math.max(questionCount, 2), 5);

    const systemMessage = `
Você é um especialista na criação de sub-checklists detalhados para perguntas de inspeção. 
Para a seguinte pergunta principal, crie um sub-checklist detalhado com ${actualQuestionCount} perguntas específicas que ajudariam a avaliar completamente este aspecto.

Crie um sub-checklist muito específico e detalhado com perguntas técnicas e relevantes. Sua resposta deve seguir exatamente este formato JSON:

{
  "title": "Um título curto e descritivo para este sub-checklist (derivado da pergunta principal)",
  "description": "Uma breve explicação do que este sub-checklist avalia",
  "questions": [
    {
      "text": "Texto da pergunta",
      "responseType": "yes_no" | "text" | "numeric" | "multiple_choice",
      "isRequired": true | false,
      "options": ["Opção 1", "Opção 2"] (apenas para o tipo multiple_choice)
    }
  ]
}

Certifique-se de que todas as perguntas estejam diretamente relacionadas à pergunta principal e ajudem a avaliá-la em detalhes.
Utilize apenas os tipos de resposta disponíveis: yes_no, text, numeric, ou multiple_choice.
Para yes_no, as respostas serão "sim" ou "não".
`;

    console.log("Gerando sub-checklist para pergunta principal:", parentQuestionText);
    console.log("Com prompt:", prompt);
    console.log("Quantidade de perguntas solicitada:", actualQuestionCount);

    // Call OpenAI API to generate sub-checklist
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
      console.error("Erro na API OpenAI:", errorText);
      throw new Error(`Erro na API OpenAI: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let subChecklist;

    try {
      const content = data.choices[0].message.content;
      console.log("Resposta bruta da IA:", content);
      
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/) || [null, content];
      const jsonContent = jsonMatch[1] || content;
      
      try {
        subChecklist = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error("Erro ao analisar JSON:", parseError);
        
        // Try to clean the content before parsing
        const cleansedContent = jsonContent.replace(/[\u0000-\u001F]+/g, " ").trim();
        subChecklist = JSON.parse(cleansedContent);
      }
      
      // Validate the structure
      if (!subChecklist.title || !Array.isArray(subChecklist.questions)) {
        throw new Error("Estrutura de sub-checklist inválida");
      }
      
      // Process the questions
      subChecklist.questions = subChecklist.questions.map((q: any) => {
        // Ensure responseType is valid
        if (!["yes_no", "text", "numeric", "multiple_choice"].includes(q.responseType)) {
          q.responseType = "yes_no";
        }
        
        // Ensure multiple_choice questions have options
        if (q.responseType === "multiple_choice" && (!q.options || !Array.isArray(q.options) || q.options.length < 2)) {
          q.options = ["Opção 1", "Opção 2", "Opção 3"];
        }
        
        return {
          text: q.text,
          responseType: q.responseType,
          isRequired: q.isRequired !== false,
          options: q.options,
          allowsPhoto: false,
          allowsVideo: false,
          allowsAudio: false
        };
      });
    } catch (parseError) {
      console.error("Erro ao analisar resposta da IA:", parseError);
      return new Response(JSON.stringify({
        success: false,
        error: "Falha ao analisar resposta da IA como JSON."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    return new Response(JSON.stringify({
      success: true,
      subChecklist: {
        title: subChecklist.title,
        description: subChecklist.description || `Sub-checklist para: ${parentQuestionText}`,
        parentQuestionId,
        questions: subChecklist.questions
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Erro ao gerar sub-checklist:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Ocorreu um erro desconhecido"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
