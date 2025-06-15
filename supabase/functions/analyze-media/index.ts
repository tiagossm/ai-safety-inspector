
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

    const { mediaUrl, additionalMediaUrls = [], questionText, userAnswer = "" } = await req.json();
    
    if (!mediaUrl && (!additionalMediaUrls || additionalMediaUrls.length === 0)) {
      return new Response(JSON.stringify({ error: "Missing media URL(s)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allMediaUrls = [mediaUrl, ...additionalMediaUrls].filter(Boolean);
    const imageContent = allMediaUrls.map(url => ({ type: "image_url", image_url: { url } }));

    const userPrompt = `
Você é um especialista sênior em Saúde e Segurança do Trabalho (SST) e sua tarefa é analisar mídias de uma inspeção de segurança.

**Contexto da Inspeção:**
- **Pergunta do Checklist:** "${questionText}"
- **Resposta do Usuário:** "${userAnswer}"

**Sua Análise:**
Analise a(s) imagem(ns) e/ou vídeo(s) fornecidos. Sua análise deve ser rigorosa e objetiva, cruzando as informações da pergunta, da resposta do usuário e da evidência visual.

**Formato de Saída (JSON Estrito):**
Você DEVE retornar um objeto JSON com a seguinte estrutura. Não adicione nenhum texto fora do objeto JSON.
{
  "analysis": "Descreva objetivamente o que você vê na mídia. Conecte suas observações com a pergunta e a resposta do usuário. Seja direto e técnico.",
  "hasNonConformity": boolean,
  "psychosocialRiskDetected": boolean,
  "plan5w2h": {
    "what": "O que precisa ser feito para corrigir a não conformidade? (Se houver)",
    "why": "Por que a correção é necessária? (Justificativa baseada em risco ou norma)",
    "who": "Quem é o responsável pela execução? (Cargo ou função, ex: 'Líder da Equipe')",
    "when": "Quando deve ser concluído? (Prazo, ex: 'Imediatamente', 'Em 24 horas')",
    "where": "Onde a ação deve ocorrer? (Local específico)",
    "how": "Como a ação deve ser executada? (Passos práticos)",
    "howMuch": ""
  }
}

**Regras de Lógica:**
1.  **hasNonConformity**:
    *   Deve ser \`true\` se a evidência visual contradiz a resposta do usuário (ex: resposta 'Sim' para 'Extintor desobstruído?', mas a foto mostra um extintor obstruído) OU se a imagem mostra uma condição insegura clara, independentemente da resposta.
    *   Deve ser \`false\` se a evidência visual está de acordo com uma resposta segura ou se não há risco aparente.
2.  **plan5w2h**:
    *   Se \`hasNonConformity\` for \`true\`, TODOS os campos do \`plan5w2h\` (exceto 'howMuch') DEVEM ser preenchidos com um plano de ação claro, prático e detalhado.
    *   Se \`hasNonConformity\` for \`false\`, TODOS os campos do \`plan5w2h\` devem ser strings vazias.
3.  **psychosocialRiskDetected**:
    *   Avalie se a mídia sugere riscos psicossociais (ex: assédio, estresse excessivo, violência no trabalho, etc.). Defina como \`true\` ou \`false\`.
4.  **howMuch**: Este campo deve ser SEMPRE uma string vazia.
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
              ...imageContent,
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
