import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// Helper function for retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries;
      const isRateLimit = error.message?.includes('Rate limit');
      
      if (isLastAttempt || !isRateLimit) {
        throw error;
      }
      
      // Extract suggested delay from error message or use exponential backoff
      let delay = baseDelay * Math.pow(2, attempt);
      const retryAfterMatch = error.message?.match(/try again in (\d+)ms/);
      if (retryAfterMatch) {
        delay = parseInt(retryAfterMatch[1]) + 100; // Add small buffer
      }
      
      console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

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
    const { mediaUrl, questionText, userAnswer = "", questionId, mediaType } = await req.json();
    if (!mediaUrl) {
      return new Response(JSON.stringify({ error: "Missing media URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Verificar se é mídia suportada
    const isImage = mediaUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
    const isVideo = mediaUrl.match(/\.(mp4|webm|mov|avi)$/i);
    const isAudio = mediaUrl.match(/\.(mp3|wav|ogg|m4a|webm)$/i);
    const isDocument = mediaUrl.match(/\.(pdf|doc|docx)$/i);

    if (!isImage && !isVideo && !isAudio && !isDocument) {
      return new Response(JSON.stringify({ error: "Unsupported media type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Prompt adaptado para diferentes tipos de mídia
    let userPrompt = "";
    let analysisContent = [];

    if (isImage) {
      userPrompt = `
Você receberá uma imagem, uma pergunta de inspeção e a resposta do usuário.

Pergunta: "${questionText}"
Resposta do usuário: "${userAnswer}"

Seu trabalho é:
1. Analisar a imagem e descrever o contexto, o ambiente ou sinais visuais que se relacionam com a pergunta e a resposta.
2. Se identificar oportunidades de melhoria, risco, sintoma, ou não conformidade, sugira um plano de ação no formato **5W2H**.
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

NUNCA preencha o campo "Quanto custa" (How much) — deixe em branco.
      `.trim();

      analysisContent = [
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
      ];
    } else {
      // Para áudio, vídeo ou documentos
      let mediaTypeText = "";
      if (isVideo) mediaTypeText = "vídeo";
      else if (isAudio) mediaTypeText = "áudio"; 
      else if (isDocument) mediaTypeText = "documento";

      userPrompt = `
Você receberá um arquivo de ${mediaTypeText} relacionado a uma pergunta de inspeção.

Pergunta: "${questionText}"
Resposta do usuário: "${userAnswer}"
URL do arquivo: ${mediaUrl}

Como não posso processar diretamente ${mediaTypeText}, baseie-se na pergunta e resposta para sugerir uma análise geral e plano de ação se necessário.

**Responda exatamente neste formato, em português:**

Comentário:
(Análise baseada na pergunta e resposta fornecidas.)

Plano de Ação (5W2H):
- O quê (What):
- Por quê (Why):
- Quem (Who):
- Quando (When):
- Onde (Where):
- Como (How):
- Quanto custa (How much): 

Se não houver ação necessária, preencha "Nenhuma ação sugerida".
      `.trim();

      analysisContent = [
        {
          type: "text",
          text: userPrompt
        }
      ];
    }

    // Chama a IA com retry logic
    const { data, analysisText } = await retryWithBackoff(async () => {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Modelo mais eficiente para reduzir rate limits
          messages: [
            {
              role: "system",
              content: "Você é um engenheiro especialista em SST. Analise de forma concisa e objetiva, sugerindo planos 5W2H para riscos identificados."
            },
            {
              role: "user",
              content: analysisContent
            }
          ],
          max_tokens: 800 // Reduzido para otimizar uso de tokens
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data.error?.message || "Unknown error";
        throw new Error(`OpenAI API error: ${errorMsg}`);
      }
      
      const analysisText = data.choices[0].message.content || "";
      return { data, analysisText };
    });

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