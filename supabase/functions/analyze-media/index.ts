import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      return new Response(JSON.stringify({
        error: "OpenAI API key not configured"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Recebe parâmetros
    const { mediaUrl, questionText, userAnswer = "", questionId } = await req.json();

    if (!mediaUrl) {
      return new Response(JSON.stringify({
        error: "Missing media URL"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // --- BLOCO DE VERIFICAÇÃO DE SINTOMA/AGRAVO PSICOSSOCIAL ---
    const sintomas = [
      "nervoso", "ansioso", "cansaço", "fadiga", "dor", "mal-estar", "depressivo", "doente", "triste",
      "estresse", "cansado", "exausto", "medo", "pânico", "desanimado", "preocupado", "preocupação"
    ];
    const perguntaLower = (questionText || "").toLowerCase();
    const userAnswerLower = (userAnswer || "").trim().toLowerCase();

    const isSintoma = sintomas.some(s => perguntaLower.includes(s));

    if (isSintoma && userAnswerLower === "sim") {
      // CASO ESPECIAL: Já retorna não conformidade diretamente, sem consulta à IA
      return new Response(JSON.stringify({
        analysis: {
          hasNonConformity: true,
          comment: "O próprio relato do usuário caracteriza não conformidade para agravo/sintoma relatado na pergunta.",
          actionPlan: "Investigar causas do agravo relatado e oferecer suporte emocional, psicológico ou médico conforme a necessidade do caso.",
          questionId
        },
        raw: {}
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // --- CASO PADRÃO: Prompt tradicional para IA ---
    const userPrompt = `
Você receberá uma imagem, uma pergunta de inspeção e a resposta dada pelo usuário.

Pergunta: "${questionText}"
Resposta do usuário: "${userAnswer}"

Seu trabalho é:
1. Analisar a imagem, identificando sinais compatíveis com o tema da pergunta.
2. Comparar a análise visual com a resposta do usuário.
3. Informar se há CONFORMIDADE ou NÃO CONFORMIDADE entre a resposta e o que é visto na imagem.
4. Se houver não conformidade, liste ações corretivas objetivas.

Atenção: O veredito deve ser "NÃO CONFORMIDADE" se a análise visual da imagem contradizer a resposta do usuário para a pergunta acima. Só marque "Sem não conformidade" (NÃO CONFORMIDADE: NÃO) se imagem e resposta estiverem em total acordo.

Exemplos:
- Se a pergunta é "Você está nervoso(a)?", a resposta é "NÃO" e a imagem mostra sinais claros de nervosismo, então: "Não Conformidade: SIM".
- Se a pergunta é "Você está nervoso(a)?", a resposta é "SIM" e a imagem mostra nervosismo, então: "Não Conformidade: NÃO".
- Se a imagem mostra calma e a resposta é "NÃO", então: "Não Conformidade: NÃO".
- Se a imagem mostra calma e a resposta é "SIM", então: "Não Conformidade: SIM".

Responda **exatamente** neste formato (em português):

Comentário:
(Comentário objetivo sobre a coerência ou incoerência entre resposta e imagem, até 3 linhas.)

Plano de Ação:
(Lista de ações corretivas claras, só se houver não conformidade. Se estiver tudo OK, escreva "Não aplicável.")

No final, escreva apenas "Não Conformidade: SIM" ou "Não Conformidade: NÃO"

NUNCA conclua por "Sem não conformidade" se houver qualquer sinal de incoerência entre imagem e resposta. Seja crítico, direto e objetivo.
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
            content: "Você é um engenheiro especialista em SST (Segurança do Trabalho), capaz de analisar imagens de inspeção e identificar não conformidades, sugerindo ações corretivas objetivas e alinhadas à legislação brasileira."
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
        max_tokens: 1000
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || "Unknown error"}`);
    }
    const analysisText = data.choices[0].message.content || "";
    // Parsing para separar cada campo
    const commentMatch = analysisText.match(/Comentário:\s*([\s\S]*?)(?:Plano de Ação:|$)/i);
    const actionPlanMatch = analysisText.match(/Plano de Ação:\s*([\s\S]*?)(?:Não Conformidade:|$)/i);
    const ncMatch = analysisText.match(/Não Conformidade:\s*(SIM|NÃO)/i);
    const comment = commentMatch ? commentMatch[1].trim() : "";
    const actionPlan = actionPlanMatch ? actionPlanMatch[1].trim() : "";
    const hasNonConformity = ncMatch ? ncMatch[1].toUpperCase() === "SIM" : !!actionPlan && actionPlan !== "Não aplicável.";

    return new Response(JSON.stringify({
      analysis: {
        hasNonConformity,
        comment,
        actionPlan: actionPlan === "Não aplicável." ? "" : actionPlan,
        questionId
      },
      raw: data
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error analyzing media:", error);
    return new Response(JSON.stringify({
      error: `Error analyzing media: ${error.message}`
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
