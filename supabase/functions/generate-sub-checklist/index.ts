
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, parentQuestionId, parentQuestionText, questionCount = 3 } = await req.json();

    if (!prompt) {
      throw new Error('Prompt é obrigatório');
    }

    if (!parentQuestionId) {
      throw new Error('ID da pergunta pai é obrigatório');
    }

    console.log(`Generating sub-checklist for parent question: ${parentQuestionText || parentQuestionId}`);
    console.log(`Using prompt: ${prompt}`);
    console.log(`Requested question count: ${questionCount}`);

    // Create a system prompt that guides the AI to generate a sub-checklist
    const systemPrompt = `
      Você é um especialista em criar checklists para inspeções e auditorias.
      Crie um sub-checklist detalhado para uma pergunta principal.
      O sub-checklist deve ter um título claro, uma descrição breve, e ${questionCount} perguntas.
      
      Para cada pergunta, defina:
      - Texto da pergunta (claro e objetivo)
      - Tipo de resposta (sim/não, múltipla escolha, texto, ou numérico)
      - Se é obrigatória (true/false)
      - Para perguntas de múltipla escolha, forneça 2-4 opções
      
      Formate a saída como um objeto JSON com a seguinte estrutura:
      {
        "title": "Título do sub-checklist",
        "description": "Breve descrição do propósito deste sub-checklist",
        "questions": [
          {
            "text": "Texto da pergunta 1",
            "responseType": "yes_no", // Pode ser "yes_no", "multiple_choice", "text", "numeric"
            "isRequired": true,
            "options": ["Opção 1", "Opção 2"] // Apenas para "multiple_choice"
          },
          // mais perguntas...
        ]
      }
    `;

    // Prepare the conversation for OpenAI
    const messages = [
      { 
        role: "system", 
        content: systemPrompt 
      },
      { 
        role: "user", 
        content: `
          Pergunta principal: "${parentQuestionText || 'Pergunta sem texto'}"
          
          Instruções adicionais: ${prompt}
          
          Gere um sub-checklist com ${questionCount} perguntas.
        `
      }
    ];

    // Make request to OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const openaiData = await openaiResponse.json();
    
    if (!openaiResponse.ok) {
      console.error("OpenAI API error:", openaiData);
      throw new Error(`Erro na API OpenAI: ${openaiData.error?.message || "Erro desconhecido"}`);
    }

    // Extract the generated text from the completion
    const generatedText = openaiData.choices[0].message.content;
    
    // Parse the JSON from the generated text
    let subChecklist;
    try {
      // Extract JSON object from the text (the AI might include markdown formatting)
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        generatedText.match(/{[\s\S]*}/);
      
      const jsonString = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : generatedText;
      subChecklist = JSON.parse(jsonString);
      
      // Basic validation of the parsed object
      if (!subChecklist.title || !Array.isArray(subChecklist.questions)) {
        throw new Error("Formato JSON inválido");
      }
      
      // Add additional properties to each question
      subChecklist.questions = subChecklist.questions.map(q => ({
        ...q,
        id: crypto.randomUUID(),
        allowsPhoto: true,
        allowsVideo: false,
        allowsAudio: false
      }));
      
    } catch (error) {
      console.error("Error parsing generated sub-checklist:", error);
      console.error("Generated text:", generatedText);
      throw new Error("Não foi possível gerar um sub-checklist válido. Tente novamente com um prompt diferente.");
    }

    return new Response(JSON.stringify({
      success: true,
      subChecklist
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error generating sub-checklist:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Erro ao gerar sub-checklist"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
