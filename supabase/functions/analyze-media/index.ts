
// Imports extras para áudio
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Helpers
function getImageExtensionFromContentType(contentType: string): string | null {
  if (contentType.includes("jpeg")) return "jpeg";
  if (contentType.includes("jpg")) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return null;
}

// Auxiliar: baixa imagem do Supabase Storage e retorna base64/data
async function fetchAndConvertImageToBase64(url: string): Promise<{ base64: string, mime: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Não foi possível baixar a imagem: permissão ou URL inválida.");
  const mime = res.headers.get("Content-Type") || "";
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(mime)) {
    throw new Error(`Formato não suportado (${mime}). Apenas: ${allowed.join(", ")}`);
  }
  const blob = await res.blob();
  // Converte para base64: necessário dado o OpenAI requer HTTP(s) acessível ou base64
  const arrayBuffer = await blob.arrayBuffer();
  const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  return {
    base64: `data:${mime};base64,${base64String}`,
    mime
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function analyzeImage(openAIApiKey: string, allMediaUrls: string[], questionText: string, userAnswer: string) {
  // Baixar/converter todas as imagens
  const allowedFormats = ["jpg", "jpeg", "png", "webp", "gif"];
  const imageContents = [];
  for (const url of allMediaUrls) {
    try {
      // Pega extensão pela URL OU pelo Content-Type após fetch
      let extension = url.split(".").pop()?.toLowerCase() || "";
      let isAllowedExt = allowedFormats.includes(extension);
      let baseObj;
      if (!isAllowedExt) {
        // Tenta pelo Content-Type depois do fetch
        baseObj = await fetchAndConvertImageToBase64(url);
        extension = getImageExtensionFromContentType(baseObj.mime) || "";
        isAllowedExt = allowedFormats.includes(extension);
      }
      if (!isAllowedExt) {
        throw new Error(
          "Você fez upload de uma imagem não suportada. Formatos aceitos: jpg, jpeg, png, webp, gif."
        );
      }
      // Se veio do Content-Type, já temos base64. Senão, tenta como está.
      if (!baseObj) {
        baseObj = await fetchAndConvertImageToBase64(url);
      }
      imageContents.push({ type: "image_url", image_url: { url: baseObj.base64 } });
    } catch (e) {
      throw new Error(e?.message || "Erro ao preparar imagem. Verifique se ela é pública e no formato correto.");
    }
  }

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
            ...imageContents,
          ],
        },
      ],
      max_tokens: 1500,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Erro de análise na OpenAI");
  }
  return JSON.parse(data.choices[0].message.content);
}

async function analyzePdf(openAIApiKey: string, pdfUrl: string, questionText: string, userAnswer: string) {
  // Não há suporte real por enquanto. Retornar mensagem amigável:
  return {
    analysis: "Análise automática de PDFs ainda não suportada. Por favor, analise manualmente o documento.",
    hasNonConformity: false,
    psychosocialRiskDetected: false,
    plan5w2h: {
      what: "",
      why: "",
      who: "",
      when: "",
      where: "",
      how: "",
      howMuch: ""
    },
    analysisType: "pdf"
  };
}

// Áudio: utiliza Whisper para transcrição e, depois, gera análise textual com contexto SST.
async function analyzeAudio(openAIApiKey: string, audioUrl: string, questionText: string, userAnswer: string) {
  // Baixa o áudio do URL:
  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) throw new Error("Erro ao baixar o áudio");

  const audioBlob = await audioRes.blob();
  const audioFile = new File([audioBlob], "audio.webm", { type: audioBlob.type });

  // Transcreve
  const form = new FormData();
  form.append("file", audioFile, "audio.webm");
  form.append("model", "whisper-1");
  // Inclui prompt para contexto, se desejar
  form.append("prompt", `Contexto SST: ${questionText}. Resposta original do usuário: ${userAnswer}`);

  const whisperResp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openAIApiKey}` },
    body: form
  });

  const whisperData = await whisperResp.json();
  if (!whisperResp.ok) throw new Error(whisperData.error?.message || "Erro Whisper");

  const transcript = whisperData.text || "";

  // Gera análise com texto transcrito
  const analysisPrompt = `
Você é um engenheiro de Segurança do Trabalho. Valide o áudio transcrito em relação à pergunta da inspeção:
Pergunta: "${questionText}"
Transcrição do áudio: "${transcript}"
Resposta original (se houver): "${userAnswer}"

Com base na transcrição, faça uma análise objetiva de possíveis não-conformidades e riscos. Use o seguinte formato de resposta (JSON apenas):

{
  "analysis": "Texto objetivo da análise",
  "hasNonConformity": boolean,
  "psychosocialRiskDetected": boolean,
  "plan5w2h": {
    "what": "",
    "why": "",
    "who": "",
    "when": "",
    "where": "",
    "how": "",
    "howMuch": ""
  },
  "transcript": "Texto transcrito"
}

Se não houver não conformidade, todos os campos do plano (menos 'howMuch') devem ser string vazia.
`.trim();

  const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAIApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Você é um engenheiro de SST que retorna análises objetivas sobre riscos e planos de ação em inspeções." },
        { role: "user", content: analysisPrompt }
      ],
      max_tokens: 1200,
    }),
  });
  const aiData = await aiResp.json();
  if (!aiResp.ok) throw new Error(aiData.error?.message || "Erro OpenAI Análise Áudio");

  const resultObj = JSON.parse(aiData.choices[0].message.content || "{}");
  return { ...resultObj, transcript };
}

serve(async (req) => {
  // CORS
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

    const { mediaUrl, additionalMediaUrls = [], questionText = "", userAnswer = "", mediaType = "" } = await req.json();
    if (!mediaUrl) {
      return new Response(JSON.stringify({ error: "Missing media URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Detecta tipo pelo mediaType ou extensão:
    const extension = mediaUrl.split(".").pop()?.toLowerCase();
    const isAudio = mediaType === "audio" || ["mp3", "wav", "ogg", "m4a", "webm"].includes(extension ?? "");
    const isImage = mediaType === "image" || ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(extension ?? "");
    const isPdf = mediaType === "pdf" || extension === "pdf";

    let analysisResult;
    if (isAudio) {
      console.log("[analyze-media] Processando áudio");
      analysisResult = await analyzeAudio(openAIApiKey, mediaUrl, questionText, userAnswer);
      analysisResult.analysisType = "audio";
    } else if (isImage) {
      console.log("[analyze-media] Processando imagem");
      const allMedia = [mediaUrl, ...(additionalMediaUrls || [])].filter(Boolean);
      analysisResult = await analyzeImage(openAIApiKey, allMedia, questionText, userAnswer);
      analysisResult.analysisType = "image";
    } else if (isPdf) {
      console.log("[analyze-media] Processando PDF");
      analysisResult = await analyzePdf(openAIApiKey, mediaUrl, questionText, userAnswer);
      analysisResult.analysisType = "pdf";
    } else {
      throw new Error("Tipo de mídia não suportado para análise.");
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in analyze-media:", error.message);
    return new Response(JSON.stringify({ error: `Erro na análise de mídia: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
