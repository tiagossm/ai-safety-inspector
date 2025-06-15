
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mediaUrl, questionText, userAnswer = "" } = await req.json();
    if (!mediaUrl) {
      return new Response(JSON.stringify({ error: "Missing media URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `
Analise a imagem fornecida no contexto da seguinte pergunta de inspeção e da resposta do usuário.

- Pergunta: "${questionText}"
- Resposta do Usuário: "${userAnswer}"

Sua tarefa é retornar um objeto JSON estritamente com a seguinte estrutura:
{
  "comment": "Uma análise curta e objetiva da imagem, focando em segurança e conformidade. Descreva o que você vê.",
  "hasNonConformity": boolean,
  "plan5w2h": {
    "what": "O que precisa ser feito?",
    "why": "Por que isso é necessário?",
    "who": "Quem é o responsável por fazer?",
    "when": "Quando deve ser feito?",
    "where": "Onde a ação deve ocorrer?",
    "how": "Como a ação deve ser executada?",
    "howMuch": ""
  }
}

- Se uma não conformidade for detectada, defina "hasNonConformity" como true e preencha o "plan5w2h" com um plano de ação claro e prático.
- Se tudo estiver em conformidade, defina "hasNonConformity" como false, e retorne um objeto "plan5w2h" com todos os campos como strings vazias.
- O campo "howMuch" deve ser sempre uma string vazia.
- Seja direto e técnico na sua análise e sugestões.
    `.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Você é um engenheiro especialista em SST (Saúde e Segurança do Trabalho) que analisa imagens de inspeções e retorna dados estruturados em JSON."
          },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: mediaUrl } },
            ],
          },
        ],
        max_tokens: 1500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data.error?.message, data);
      throw new Error(data.error?.message || "Unknown OpenAI error");
    }

    const analysisResult = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error analyzing media:", error.message);
    return new Response(JSON.stringify({ error: `Error analyzing media: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

