import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    // Recebe parâmetros
    const { mediaUrl, questionText, userAnswer = "", questionId } = await req.json();
    if (!mediaUrl) {
      return new Response(JSON.stringify({ error: "Missing media URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Prompt 5W2H: análise crítica, sem julgar conformidade!
    const userPrompt = `
Você receberá uma imagem, uma pergunta de inspeção e a resposta do usuário.

Pergunta: "${questionText}"
Resposta do usuário: "${userAnswer}"

Seu trabalho é:
1. Analisar a imagem e descrever o contexto, o ambiente ou sinais visuais que se relacionam com a pergunta e a resposta.
2. Se identificar oportunidades de melhoria, risco, sintoma, ou não conformidade, sugira um plano de ação no formato **5W2H** (O quê, Por quê, Quem, Quando, Onde, Como).  
- "Quanto custa" deve ser deixado em aberto para preenchimento posterior.
3. Caso não haja ação necessária, responda "Nenhuma ação sugerida".

**Responda exatamente neste formato, em português:**

Comentário:
(Síntese objetiva da análise contextual da imagem.)

Plano de Ação (5W2H):
- O quê (What):
- Por quê (Why):
- Quem (Who):
- Quando (When):
- Onde (Where):
- Como (How):
- Quanto custa (How much): 

Se não houver ação sugerida, preencha o campo “Plano de Ação” com “Nenhuma ação sugerida”.

Exemplo:
Comentário:
A imagem mostra um colaborador aparentemente tenso, de acordo com a resposta "Sim".

Plano de Ação (5W2H):
- O quê (What): Incentivar técnicas de respiração.
- Por quê (Why): Reduzir o nervosismo relatado.
- Quem (Who): Próprio colaborador.
- Quando (When): Imediatamente.
- Onde (Where): Local de trabalho.
- Como (How): Realizar pausas para exercícios respiratórios guiados.
- Quanto custa (How much): 

NUNCA preencha o campo "Quanto custa" (How much) — deixe em branco.
    `.trim();

    // Chama a IA normalmente
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é um engenheiro especialista em SST (Saúde e Segurança do Trabalho), capaz de analisar imagens e sugerir planos de ação detalhados no formato 5W2H para riscos ou oportunidades identificadas."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: mediaUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1200
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || "Unknown error"}`);
    }
    const analysisText = data.choices[0].message.content || "";

    // Faz parsing dos campos
    const get = (label: string) => {
      const m = analysisText.match(new RegExp(`${label}:\\s*([\\s\\S]*?)(?:\\n-|$)`, 'i'));
      return m ? m[1].trim() : "";
    };

    const commentMatch = analysisText.match(/Comentário:\s*([\s\S]*?)(?:Plano de Ação|$)/i);
    const comment = commentMatch ? commentMatch[1].trim() : "";

    let actionPlan = {
      what: get("O quê \\(What\\)"),
      why: get("Por quê \\(Why\\)"),
      who: get("Quem \\(Who\\)"),
      when: get("Quando \\(When\\)"),
      where: get("Onde \\(Where\\)"),
      how: get("Como \\(How\\)"),
      howMuch: "" // sempre em branco!
    };

    // Se não houver ação sugerida:
    if (/nenhuma ação sugerida/i.test(analysisText)) {
      actionPlan = {
        what: "",
        why: "",
        who: "",
        when: "",
        where: "",
        how: "",
        howMuch: ""
      };
    }

    return new Response(JSON.stringify({
      actionPlan,
      comment,
      questionId,
      raw: data
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error analyzing media:", error);
    return new Response(JSON.stringify({
      error: `Error analyzing media: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
