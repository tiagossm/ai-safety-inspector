
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// List of psychosocial risk keywords for detection
const PSYCHOSOCIAL_KEYWORDS = [
  "estresse", "cansaço", "exaustão", "pressão", "fadiga", "burnout", "grito", "xingar", "humilhação", "assédio",
  "autoritarismo", "ansiedade", "depressão", "medo", "tristeza", "ambiente pesado", "clima ruim", "isolado",
  "sem apoio", "falta de reconhecimento", "correria", "sem pausa", "rigidez", "sem autonomia", "sem liberdade",
  "não posso opinar", "ameaça de punição", "discriminação", "preconceito"
];

// Interface for the expected body content
interface RequestBody {
  mediaUrl?: string;
  mediaType?: string;
  questionText?: string;
  responseValue?: boolean;
  mediaUrls?: string[];
  multimodal?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestData: RequestBody = await req.json()
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiApiKey) {
      console.warn('OpenAI API Key não configurada, usando análise simulada')
      return simulateAnalysis(requestData, corsHeaders)
    }

    let result;
    
    // Check if we're doing multimodal analysis
    if (requestData.multimodal && requestData.mediaUrls?.length) {
      result = await performMultimodalAnalysis(
        requestData.mediaUrls, 
        openaiApiKey, 
        requestData.questionText,
        requestData.responseValue
      );
    } else if (requestData.mediaUrl) {
      // Determine media type to process single files
      const mediaType = requestData.mediaType || determineMediaType(requestData.mediaUrl);
      
      if (mediaType.startsWith('image/') || mediaType === 'image') {
        result = await analyzeImage(requestData.mediaUrl, openaiApiKey, requestData.questionText);
      } else if (mediaType.startsWith('audio/') || mediaType === 'audio' || requestData.mediaUrl.endsWith('.webm') || requestData.mediaUrl.includes('audio')) {
        result = await transcribeAudio(requestData.mediaUrl, openaiApiKey, requestData.questionText);
      } else if (mediaType.startsWith('video/') || mediaType === 'video') {
        result = await analyzeVideoAsImage(requestData.mediaUrl, openaiApiKey, requestData.questionText);
      } else {
        throw new Error(`Tipo de mídia não suportado: ${mediaType}`);
      }
    } else {
      throw new Error('URL da mídia não fornecida');
    }

    // Registrar resultado para debug
    console.log("Análise concluída com sucesso:", JSON.stringify(result).substring(0, 200) + "...");

    // Retornar os resultados da análise com cabeçalhos CORS
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    // Retornar erro com cabeçalhos CORS
    return new Response(
      JSON.stringify({
        error: true,
        message: error.message || 'Erro desconhecido durante análise de mídia'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

// Helper to determine media type from URL
function determineMediaType(url: string): string {
  if (url.match(/\.(jpeg|jpg|gif|png)$/i)) return 'image';
  if (url.match(/\.(mp4|webm|mov)$/i)) return 'video';
  if (url.match(/\.(mp3|wav|ogg|webm)$/i) || url.includes('audio')) return 'audio';
  return 'image'; // Default to image
}

// Function to check for psychosocial risk keywords in text
function detectPsychosocialRisks(text: string): boolean {
  if (!text) return false;
  
  const lowercaseText = text.toLowerCase();
  return PSYCHOSOCIAL_KEYWORDS.some(keyword => lowercaseText.includes(keyword.toLowerCase()));
}

// Função para análise de imagem usando OpenAI Vision
async function analyzeImage(imageUrl: string, apiKey: string, questionText?: string) {
  try {
    console.log("Analisando imagem:", imageUrl, "Pergunta:", questionText);
    
    // Criar um prompt contextualizado com a pergunta, se disponível
    const promptText = questionText 
      ? `Analise esta imagem no contexto da seguinte pergunta: "${questionText}". 
         Identifique se há conformidade ou não conformidade com os requisitos mencionados. 
         Se houver não conformidade, sugira ações corretivas específicas e detalhadas que poderiam ser incluídas em um plano de ação.
         No final, indique claramente se foi detectada uma não-conformidade.`
      : 'Descreva esta imagem em detalhes, identificando possíveis problemas de segurança ou manutenção visíveis.';
    
    // Criar instruções de sistema contextualizadas
    const systemContent = questionText 
      ? `Você é um especialista em segurança e inspeção. Analise a imagem em detalhe em relação à pergunta específica: "${questionText}". 
         Identifique claramente se a situação na imagem está em conformidade ou não com os requisitos mencionados na pergunta. 
         Se houver não conformidade, descreva exatamente o que está errado e sugira medidas corretivas específicas.
         
         Sua resposta deve ter dois componentes principais:
         1. Análise detalhada da imagem em relação à pergunta.
         2. Se detectada uma não conformidade, forneça uma lista clara de ações corretivas sugeridas para um plano de ação.
         
         Concluir sua análise indicando explicitamente se há não-conformidade detectada.`
      : 'Você é um especialista em segurança e inspeção. Analise a imagem em detalhe, identificando possíveis riscos, problemas de segurança ou situações que requerem atenção. Seja detalhado e específico.';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Usando o modelo mais recente gpt-4o que substitui o gpt-4-vision-preview
        messages: [
          {
            role: 'system',
            content: systemContent
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: promptText
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro na resposta da OpenAI:", errorData);
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    // Adicionar log para debug
    console.log("OpenAI response:", JSON.stringify(data).substring(0, 300));
    
    // Verificar se a resposta tem o formato esperado e evita acessar propriedade indefinida
    if (!data.choices || data.choices.length === 0) {
      console.error("Resposta inesperada da OpenAI:", data);
      throw new Error("Formato de resposta da OpenAI inesperado");
    }
    
    const analysis = data.choices[0]?.message?.content;
    if (!analysis) {
      throw new Error("Análise vazia recebida da API");
    }
    
    // Extrair sugestões de plano de ação e verificar conformidade
    const hasNonConformity = 
      analysis.toLowerCase().includes("não conformidade") || 
      analysis.toLowerCase().includes("não está em conformidade") ||
      analysis.toLowerCase().includes("non-compliance") ||
      analysis.toLowerCase().includes("não conforme");
    
    // Check for psychosocial risk indicators in image analysis
    const psychosocialRiskDetected = detectPsychosocialRisks(analysis);
    
    let actionPlanSuggestion = null;
    
    if (hasNonConformity || psychosocialRiskDetected) {
      // Tentar extrair as ações corretivas ou plano de ação sugerido
      const actionPlanMatch = analysis.match(/ações corretivas[:\s]*([\s\S]*?)(?=\n\n|\n$|$)/i) ||
                              analysis.match(/plano de ação[:\s]*([\s\S]*?)(?=\n\n|\n$|$)/i) ||
                              analysis.match(/medidas corretivas[:\s]*([\s\S]*?)(?=\n\n|\n$|$)/i) ||
                              analysis.match(/sugestões[:\s]*([\s\S]*?)(?=\n\n|\n$|$)/i);
      
      if (actionPlanMatch && actionPlanMatch[1]) {
        actionPlanSuggestion = actionPlanMatch[1].trim();
      } else {
        // Se não conseguir extrair um trecho específico, usar parte da análise
        const sentences = analysis.split('.');
        const relevantSentences = sentences.filter(s => 
          s.toLowerCase().includes('suger') || 
          s.toLowerCase().includes('recomend') || 
          s.toLowerCase().includes('deveria') ||
          s.toLowerCase().includes('precisa ser') ||
          s.toLowerCase().includes('necessário')
        );
        
        if (relevantSentences.length > 0) {
          actionPlanSuggestion = relevantSentences.join('. ').trim() + '.';
        } else {
          let suggestion = "Desenvolver plano de ação para corrigir ";
          if (hasNonConformity) {
            suggestion += "a não conformidade detectada na imagem";
          }
          if (psychosocialRiskDetected) {
            suggestion += hasNonConformity ? " e " : "";
            suggestion += "os possíveis riscos psicossociais identificados";
          }
          suggestion += ".";
          actionPlanSuggestion = suggestion;
        }
      }
    }
    
    return {
      type: 'image',
      analysis: analysis,
      hasNonConformity,
      psychosocialRiskDetected,
      actionPlanSuggestion,
      error: false,
      questionText
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      type: 'image',
      analysis: 'Erro ao analisar imagem: ' + error.message,
      error: true,
      questionText
    }
  }
}

// Function to analyze multiple media files together
async function performMultimodalAnalysis(mediaUrls: string[], apiKey: string, questionText?: string, responseValue?: boolean) {
  try {
    console.log("Performing multimodal analysis of", mediaUrls.length, "media files");
    
    // First, categorize media by type
    const imageUrls = mediaUrls.filter(url => url.match(/\.(jpeg|jpg|gif|png)$/i));
    const audioUrls = mediaUrls.filter(url => url.match(/\.(mp3|wav|ogg)$/i) || url.includes('audio'));
    const videoUrls = mediaUrls.filter(url => url.match(/\.(mp4|webm|mov)$/i));
    
    console.log("Media breakdown: Images:", imageUrls.length, "Audio:", audioUrls.length, "Video:", videoUrls.length);
    
    // Initialize the result object
    const result: any = {
      type: "multimodal",
      hasNonConformity: false,
      psychosocialRiskDetected: false,
      questionText
    };
    
    // If we have images, analyze the first image with GPT-4o
    if (imageUrls.length > 0) {
      const imageAnalysis = await analyzeImage(imageUrls[0], apiKey, questionText);
      result.imageAnalysis = imageAnalysis.analysis;
      
      // If any image analysis indicates non-conformity, mark the whole result as non-conformity
      if (imageAnalysis.hasNonConformity) {
        result.hasNonConformity = true;
        result.actionPlanSuggestion = imageAnalysis.actionPlanSuggestion;
      }
      
      // If psychosocial risks detected, mark the result
      if (imageAnalysis.psychosocialRiskDetected) {
        result.psychosocialRiskDetected = true;
        if (!result.actionPlanSuggestion) {
          result.actionPlanSuggestion = imageAnalysis.actionPlanSuggestion;
        }
      }
      
      // If we have multiple images, add a note about it
      if (imageUrls.length > 1) {
        result.imageAnalysis += `\n\nNota: ${imageUrls.length - 1} imagem(ns) adicional(is) também foi/foram anexada(s), mas não analisada(s) individualmente.`;
      }
    }
    
    // If we have audio files, analyze the first audio file
    if (audioUrls.length > 0) {
      const audioAnalysis = await transcribeAudio(audioUrls[0], apiKey, questionText);
      result.audioTranscription = audioAnalysis.transcription;
      result.audioSentiment = audioAnalysis.analysis;
      
      // If audio analysis indicates non-conformity, mark the result as non-conformity
      if (audioAnalysis.hasNonConformity) {
        result.hasNonConformity = true;
        // Only use audio action plan if we don't already have one from images
        if (!result.actionPlanSuggestion) {
          result.actionPlanSuggestion = audioAnalysis.actionPlanSuggestion;
        }
      }
      
      // If audio analysis indicates psychosocial risk, mark the result
      if (audioAnalysis.psychosocialRiskDetected) {
        result.psychosocialRiskDetected = true;
        // Add or enhance action plan for psychosocial risks
        if (!result.actionPlanSuggestion) {
          result.actionPlanSuggestion = audioAnalysis.actionPlanSuggestion;
        } else if (audioAnalysis.actionPlanSuggestion && !result.actionPlanSuggestion.includes("psicossocial")) {
          result.actionPlanSuggestion += "\n\nRecomendações para riscos psicossociais: " + 
            audioAnalysis.actionPlanSuggestion;
        }
      }
    }
    
    // If we have video files, analyze the first video file (as an image)
    if (videoUrls.length > 0) {
      const videoAnalysis = await analyzeVideoAsImage(videoUrls[0], apiKey, questionText);
      result.videoAnalysis = videoAnalysis.analysis;
      
      // If video analysis indicates non-conformity, mark the result as non-conformity
      if (videoAnalysis.hasNonConformity) {
        result.hasNonConformity = true;
        // Only use video action plan if we don't already have one from images or audio
        if (!result.actionPlanSuggestion) {
          result.actionPlanSuggestion = videoAnalysis.actionPlanSuggestion;
        }
      }
      
      // If video analysis indicates psychosocial risk, mark the result
      if (videoAnalysis.psychosocialRiskDetected) {
        result.psychosocialRiskDetected = true;
        // Add or enhance action plan for psychosocial risks
        if (!result.actionPlanSuggestion) {
          result.actionPlanSuggestion = videoAnalysis.actionPlanSuggestion;
        }
      }
    }
    
    // Generate a summary based on all the analysis results
    result.summary = generateMultimodalSummary(result, questionText, responseValue);
    
    console.log("Multimodal analysis complete. HasNonConformity:", result.hasNonConformity);
    return result;
  } catch (error) {
    console.error('Error in multimodal analysis:', error);
    return {
      type: 'multimodal',
      summary: `Erro na análise multimodal: ${error.message}`,
      hasNonConformity: false,
      psychosocialRiskDetected: false,
      error: true,
      questionText
    };
  }
}

// Função para analisar vídeo tratando como imagem
async function analyzeVideoAsImage(videoUrl: string, apiKey: string, questionText?: string) {
  try {
    console.log("Analisando vídeo como imagem:", videoUrl, "Pergunta:", questionText);
    
    // Criar um prompt contextualizado com a pergunta, se disponível
    const promptText = questionText 
      ? `Analise este vídeo/frame no contexto da seguinte pergunta: "${questionText}". 
         Identifique se há conformidade ou não conformidade com os requisitos mencionados. 
         Se houver não conformidade, sugira ações corretivas específicas para um plano de ação.
         No final, indique claramente se foi detectada uma não-conformidade.`
      : 'Descreva o que você consegue ver neste vídeo/frame, identificando possíveis problemas de segurança ou manutenção visíveis.';
    
    // Criar instruções de sistema contextualizadas
    const systemContent = questionText 
      ? `Você é um especialista em segurança e inspeção. Analise o vídeo/frame em detalhe em relação à pergunta específica: "${questionText}". 
         Identifique claramente se a situação no vídeo está em conformidade ou não com os requisitos mencionados na pergunta. 
         Se houver não conformidade, descreva exatamente o que está errado e sugira medidas corretivas específicas para um plano de ação.
         
         Sua resposta deve ter dois componentes principais:
         1. Análise detalhada do vídeo em relação à pergunta.
         2. Se detectada uma não conformidade, forneça uma lista clara de ações corretivas sugeridas para um plano de ação.
         
         Concluir sua análise indicando explicitamente se há não-conformidade detectada.`
      : 'Você é um especialista em segurança e inspeção. Analise o vídeo/frame em detalhe, identificando possíveis riscos ou situações que requerem atenção.';
    
    // Usar a API Vision para analisar o primeiro frame ou thumbnail do vídeo
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemContent
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: promptText
              },
              {
                type: 'image_url',
                image_url: {
                  url: videoUrl
                }
              }
            ]
          }
        ],
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na resposta da OpenAI: ${response.status} - ${errorText}`);
      
      // Se não conseguir analisar como imagem, fornecer uma resposta simulada
      return {
        type: 'video',
        analysis: 'Foi detectado um vídeo. A análise de conteúdo de vídeo está disponível através da visualização dos frames. Recomendamos analisar visualmente o conteúdo.',
        error: false,
        questionText
      };
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Formato de resposta da OpenAI inesperado");
    }
    
    const analysis = data.choices[0]?.message?.content;
    
    // Extrair sugestões de plano de ação e verificar conformidade
    const hasNonConformity = 
      analysis.toLowerCase().includes("não conformidade") || 
      analysis.toLowerCase().includes("não está em conformidade") ||
      analysis.toLowerCase().includes("non-compliance") ||
      analysis.toLowerCase().includes("não conforme");
      
    // Check for psychosocial risk indicators in video analysis
    const psychosocialRiskDetected = detectPsychosocialRisks(analysis);
    
    let actionPlanSuggestion = null;
    
    if (hasNonConformity || psychosocialRiskDetected) {
      // Tentar extrair as ações corretivas ou plano de ação sugerido
      const actionPlanMatch = analysis.match(/ações corretivas[:\s]*([\s\S]*?)(?=\n\n|\n$|$)/i) ||
                              analysis.match(/plano de ação[:\s]*([\s\S]*?)(?=\n\n|\n$|$)/i) ||
                              analysis.match(/medidas corretivas[:\s]*([\s\S]*?)(?=\n\n|\n$|$)/i) ||
                              analysis.match(/sugestões[:\s]*([\s\S]*?)(?=\n\n|\n$|$)/i);
      
      if (actionPlanMatch && actionPlanMatch[1]) {
        actionPlanSuggestion = actionPlanMatch[1].trim();
      } else if (analysis) {
        // Se não conseguir extrair um trecho específico, usar parte da análise
        const sentences = analysis.split('.');
        const relevantSentences = sentences.filter(s => 
          s.toLowerCase().includes('suger') || 
          s.toLowerCase().includes('recomend') || 
          s.toLowerCase().includes('deveria') ||
          s.toLowerCase().includes('precisa ser') ||
          s.toLowerCase().includes('necessário')
        );
        
        if (relevantSentences.length > 0) {
          actionPlanSuggestion = relevantSentences.join('. ').trim() + '.';
        } else {
          let suggestion = "Desenvolver plano de ação para corrigir ";
          if (hasNonConformity) {
            suggestion += "a não conformidade detectada no vídeo";
          }
          if (psychosocialRiskDetected) {
            suggestion += hasNonConformity ? " e " : "";
            suggestion += "os possíveis riscos psicossociais identificados";
          }
          suggestion += ".";
          actionPlanSuggestion = suggestion;
        }
      }
    }
    
    return {
      type: 'video',
      analysis: analysis || 'Análise de vídeo concluída',
      hasNonConformity,
      psychosocialRiskDetected,
      actionPlanSuggestion,
      error: false,
      questionText
    }
  } catch (error) {
    console.error('Error analyzing video:', error);
    return {
      type: 'video',
      analysis: 'Este é um vídeo. A análise detalhada não está disponível neste momento. Recomendamos revisar o conteúdo manualmente.',
      error: false,
      questionText
    }
  }
}

// Função para transcrição de áudio usando OpenAI Whisper API
async function transcribeAudio(audioUrl: string, apiKey: string, questionText?: string) {
  try {
    console.log("Transcrevendo áudio:", audioUrl, "Pergunta:", questionText);
    
    // Primeiro, precisamos baixar o arquivo de áudio
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Erro ao baixar áudio: ${audioResponse.status}`);
    }
    
    // Obter o blob do áudio
    const audioBlob = await audioResponse.blob();
    
    // Criar FormData para enviar para a API Whisper
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm'); // Usando .webm para maior compatibilidade
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt'); // Especificando português como idioma
    formData.append('response_format', 'json');
    
    // Enviar para a API Whisper
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    
    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error(`Erro na API Whisper: ${whisperResponse.status} - ${errorText}`);
      throw new Error(`Erro na transcrição de áudio: ${errorText}`);
    }
    
    const transcriptionData = await whisperResponse.json();
    console.log("Transcrição concluída:", transcriptionData);
    
    // Check for psychosocial risk keywords in the transcription
    const psychosocialRiskDetected = detectPsychosocialRisks(transcriptionData.text);
    
    // Após transcrição, podemos opcionalmente analisar o conteúdo com a API GPT
    let analysis = '';
    let hasNonConformity = false;
    let actionPlanSuggestion = null;
    
    try {
      if (transcriptionData.text && transcriptionData.text.trim() !== '') {
        // Criar um prompt contextualizado com a pergunta, se disponível
        const promptText = questionText 
          ? `Analise a seguinte transcrição de áudio no contexto da pergunta: "${questionText}".
             Identifique se o conteúdo do áudio indica conformidade ou não conformidade com os requisitos mencionados.
             Se houver não conformidade, sugira ações corretivas específicas para um plano de ação.
             Além disso, verifique se há indícios de riscos psicossociais (como estresse, fadiga, assédio, autoritarismo, etc.) no conteúdo.
             A transcrição é: ${transcriptionData.text}
             
             No final, indique claramente se foi detectada uma não-conformidade e/ou riscos psicossociais.`
          : `Analise esta transcrição de áudio de uma inspeção: ${transcriptionData.text}
             Verifique se há indícios de riscos psicossociais (como estresse, fadiga, assédio, autoritarismo, etc.) no conteúdo.
             Indique claramente se foram detectados riscos psicossociais.`;
        
        // Criar instruções de sistema contextualizadas
        const systemContent = questionText 
          ? `Você é um especialista em segurança e inspeção. Analise a transcrição do áudio em relação à pergunta específica: "${questionText}".
             Avalie se o conteúdo do áudio indica conformidade ou não com os requisitos mencionados na pergunta.
             Se houver não conformidade, identifique o que está errado e sugira medidas corretivas específicas.
             
             Além disso, analise se há indícios de riscos psicossociais, como:
             - Estresse ou exaustão emocional
             - Assédio moral ou bullying
             - Ambiente de trabalho hostil
             - Pressão excessiva
             - Autoritarismo ou abuso de poder
             - Falta de reconhecimento ou suporte
             - Discriminação ou preconceito
             
             Sua resposta deve ter três componentes principais:
             1. Análise detalhada da transcrição em relação à pergunta.
             2. Análise de potenciais riscos psicossociais na comunicação.
             3. Se detectada uma não conformidade ou riscos psicossociais, forneça uma lista clara de ações corretivas sugeridas.
             
             Concluir sua análise indicando explicitamente se há não-conformidade e/ou riscos psicossociais detectados.`
          : `Você é um especialista em segurança e inspeção. Analise a transcrição do áudio e identifique informações importantes relacionadas a inspeções, segurança ou manutenção.
             
             Analise também se há indícios de riscos psicossociais, como:
             - Estresse ou exaustão emocional
             - Assédio moral ou bullying
             - Ambiente de trabalho hostil
             - Pressão excessiva
             - Autoritarismo ou abuso de poder
             - Falta de reconhecimento ou suporte
             - Discriminação ou preconceito
             
             Concluir sua análise indicando explicitamente se há riscos psicossociais detectados.`;
        
        const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: systemContent
              },
              {
                role: 'user',
                content: promptText
              }
            ],
            max_tokens: 800
          })
        });
        
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          analysis = analysisData.choices?.[0]?.message?.content || '';
          
          // Verificar se há não conformidade na análise
          hasNonConformity = 
            analysis.toLowerCase().includes("não conformidade") || 
            analysis.toLowerCase().includes("não está em conformidade") ||
            analysis.toLowerCase().includes("non-compliance") ||
            analysis.toLowerCase().includes("não conforme");
          
          // If we already detected psychosocial risks in transcription or the analysis confirms it
          const psychosocialDetectedInAnalysis = 
            analysis.toLowerCase().includes("risco psicossocial") || 
            analysis.toLowerCase().includes("riscos psicossociais") ||
            analysis.toLowerCase().includes("indício de risco psicossocial");
          
          // Use either the automatic detection or the GPT analysis detection
          const finalPsychosocialRiskDetected = psychosocialRiskDetected || psychosocialDetectedInAnalysis;
            
          if (hasNonConformity || finalPsychosocialRiskDetected) {
            // Tentar extrair as ações corretivas ou plano de ação sugerido
            const actionPlanMatch = analysis.match(/ações corretivas[:\s]*([\s\S]*?)(?=\n\n|\n$|$)/i) ||
                                   analysis.match(/plano de ação[:\s]*([\s\S]*?)(?=\n\n|\n$|$)/i) ||
                                   analysis.match(/medidas corretivas[:\s]*([\s\S]*?)(?=\n\n|\n$|$)/i) ||
                                   analysis.match(/sugestões[:\s]*([\s\S]*?)(?=\n\n|\n$|$)/i);
                                   
            if (actionPlanMatch && actionPlanMatch[1]) {
              actionPlanSuggestion = actionPlanMatch[1].trim();
            } else if (analysis) {
              // Se não conseguir extrair um trecho específico, usar parte da análise
              const sentences = analysis.split('.');
              const relevantSentences = sentences.filter(s => 
                s.toLowerCase().includes('suger') || 
                s.toLowerCase().includes('recomend') || 
                s.toLowerCase().includes('deveria') ||
                s.toLowerCase().includes('precisa ser') ||
                s.toLowerCase().includes('necessário')
              );
              
              if (relevantSentences.length > 0) {
                actionPlanSuggestion = relevantSentences.join('. ').trim() + '.';
              } else {
                let suggestion = "Desenvolver plano de ação para abordar ";
                if (hasNonConformity) {
                  suggestion += "a não conformidade detectada no áudio";
                }
                if (finalPsychosocialRiskDetected) {
                  suggestion += hasNonConformity ? " e " : "";
                  suggestion += "os riscos psicossociais identificados na comunicação";
                }
                suggestion += ".";
                actionPlanSuggestion = suggestion;
              }
            }
          }
          
          return {
            type: 'audio',
            transcription: transcriptionData.text || 'Nenhum texto detectado no áudio',
            analysis: analysis || 'Não foi possível analisar o conteúdo do áudio',
            hasNonConformity,
            psychosocialRiskDetected: finalPsychosocialRiskDetected,
            actionPlanSuggestion,
            error: false,
            questionText
          }
        }
      }
    } catch (analysisError) {
      console.warn("Erro na análise do conteúdo transcrito:", analysisError);
      // Não propagamos este erro, apenas log, pois a transcrição já foi bem sucedida
    }
    
    return {
      type: 'audio',
      transcription: transcriptionData.text || 'Nenhum texto detectado no áudio',
      analysis: analysis || 'Não foi possível analisar o conteúdo do áudio',
      hasNonConformity,
      psychosocialRiskDetected,
      actionPlanSuggestion,
      error: false,
      questionText
    }
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return {
      type: 'audio',
      transcription: 'Erro ao transcrever áudio: ' + error.message,
      analysis: 'Não foi possível analisar o conteúdo devido a um erro na transcrição',
      error: true,
      questionText
    }
  }
}

// Gerar um resumo para análise multimodal
function generateMultimodalSummary(result: any, questionText?: string, responseValue?: boolean) {
  const hasImageAnalysis = !!result.imageAnalysis;
  const hasVideoAnalysis = !!result.videoAnalysis;
  const hasAudioTranscription = !!result.audioTranscription;
  const hasNonConformity = result.hasNonConformity;
  const hasPsychosocialRisk = result.psychosocialRiskDetected;
  
  let summary = '';
  
  if (questionText) {
    summary = `Análise da questão: "${questionText}"\n\n`;
  }
  
  if (responseValue !== undefined) {
    summary += `Resposta registrada: ${responseValue ? 'Sim' : 'Não'}\n\n`;
  }
  
  let analysisResult = '';
  if (hasNonConformity && hasPsychosocialRisk) {
    analysisResult = 'Potencial não conformidade e riscos psicossociais detectados';
  } else if (hasNonConformity) {
    analysisResult = 'Potencial não conformidade detectada';
  } else if (hasPsychosocialRisk) {
    analysisResult = 'Riscos psicossociais detectados';
  } else {
    analysisResult = 'Nenhuma não conformidade ou risco psicossocial detectado';
  }
  
  summary += `Resultado da análise de IA: ${analysisResult}\n\n`;
  
  if (hasImageAnalysis || hasVideoAnalysis || hasAudioTranscription) {
    summary += 'Mídias analisadas:\n';
    
    if (hasImageAnalysis) {
      summary += '- Imagem(ns) analisada(s) com GPT-4o\n';
    }
    
    if (hasVideoAnalysis) {
      summary += '- Vídeo(s) analisado(s) com GPT-4o\n';
    }
    
    if (hasAudioTranscription) {
      summary += '- Áudio(s) transcrito(s) com Whisper e analisado(s) com GPT-4o\n';
    }
  } else {
    summary += 'Nenhuma mídia foi analisada.';
  }
  
  return summary;
}

// Função para simular análise quando não temos API key
function simulateAnalysis(requestData: RequestBody, corsHeaders: any) {
  if (requestData.multimodal && requestData.mediaUrls?.length) {
    // Simular análise multimodal
    const result = {
      type: 'multimodal',
      summary: `Esta é uma análise simulada de ${requestData.mediaUrls.length} mídias anexadas à pergunta "${requestData.questionText || 'sem pergunta'}". Configure a API do OpenAI para obter análises reais.`,
      hasNonConformity: true,
      psychosocialRiskDetected: Math.random() > 0.5, // Simulate psychosocial risk detection randomly
      imageAnalysis: requestData.mediaUrls.some(url => url.match(/\.(jpeg|jpg|gif|png)$/i)) 
        ? "Esta é uma análise simulada de imagem. Configure a API do OpenAI para obter análises reais." 
        : undefined,
      audioTranscription: requestData.mediaUrls.some(url => url.match(/\.(mp3|wav|ogg)$/i) || url.includes('audio'))
        ? "Esta é uma transcrição simulada de áudio. Configure a API do OpenAI para obter transcrições reais."
        : undefined,
      videoAnalysis: requestData.mediaUrls.some(url => url.match(/\.(mp4|webm|mov)$/i))
        ? "Esta é uma análise simulada de vídeo. Configure a API do OpenAI para obter análises reais."
        : undefined,
      actionPlanSuggestion: "Exemplo de sugestão de plano de ação simulada. Configure a API do OpenAI para obter sugestões reais.",
      simulated: true,
      error: false,
      questionText: requestData.questionText
    };
    
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } else if (requestData.mediaUrl) {
    const mediaType = requestData.mediaType || determineMediaType(requestData.mediaUrl);
    let result;
    
    if (mediaType === 'image' || mediaType.startsWith('image/')) {
      result = {
        type: 'image',
        analysis: requestData.questionText 
          ? `Esta é uma análise simulada de imagem relacionada à pergunta: "${requestData.questionText}". Configure a API do OpenAI na função edge analyze-media para obter análises reais utilizando inteligência artificial.`
          : 'Esta é uma análise simulada de imagem. Configure a API do OpenAI na função edge analyze-media para obter análises reais utilizando inteligência artificial.',
        hasNonConformity: true,
        psychosocialRiskDetected: Math.random() > 0.7, // 30% chance of psychosocial risk in image
        actionPlanSuggestion: requestData.questionText
          ? `Exemplo de sugestão de plano de ação para a pergunta: "${requestData.questionText}". Configure a API do OpenAI para obter sugestões reais baseadas na análise da imagem.`
          : "Exemplo de sugestão de plano de ação simulada. Configure a API do OpenAI para obter sugestões reais.",
        simulated: true,
        error: false,
        questionText: requestData.questionText
      }
    } else if (mediaType === 'audio' || mediaType.startsWith('audio/') || requestData.mediaUrl.endsWith('.webm') || requestData.mediaUrl.includes('audio')) {
      result = {
        type: 'audio',
        transcription: 'Esta é uma transcrição simulada de áudio. Configure a API do OpenAI na função edge analyze-media para obter transcrições reais utilizando a tecnologia Whisper AI.',
        analysis: requestData.questionText 
          ? `Esta é uma análise simulada de áudio relacionada à pergunta: "${requestData.questionText}". Configure a API do OpenAI para obter análises reais.`
          : 'Análise simulada do conteúdo de áudio.',
        hasNonConformity: true,
        psychosocialRiskDetected: true, // Always show psychosocial risk in simulated audio analysis
        actionPlanSuggestion: requestData.questionText
          ? `Exemplo de sugestão de plano de ação para a pergunta: "${requestData.questionText}". Configure a API do OpenAI para obter sugestões reais baseadas na transcrição e análise do áudio. Recomendamos também atenção aos riscos psicossociais identificados no áudio.`
          : "Exemplo de sugestão de plano de ação simulada, incluindo abordagem para riscos psicossociais detectados. Configure a API do OpenAI para obter sugestões reais.",
        simulated: true,
        error: false,
        questionText: requestData.questionText
      }
    } else if (mediaType === 'video' || mediaType.startsWith('video/')) {
      result = {
        type: 'video',
        analysis: requestData.questionText 
          ? `Esta é uma análise simulada de vídeo relacionada à pergunta: "${requestData.questionText}". Configure a API do OpenAI na função edge analyze-media para obter análises reais utilizando inteligência artificial.`
          : 'Esta é uma análise simulada de vídeo. Configure a API do OpenAI na função edge analyze-media para obter análises reais utilizando inteligência artificial.',
        hasNonConformity: true,
        psychosocialRiskDetected: Math.random() > 0.5, // 50% chance of psychosocial risk in video
        actionPlanSuggestion: requestData.questionText
          ? `Exemplo de sugestão de plano de ação para a pergunta: "${requestData.questionText}". Configure a API do OpenAI para obter sugestões reais baseadas na análise do vídeo.`
          : "Exemplo de sugestão de plano de ação simulada. Configure a API do OpenAI para obter sugestões reais.",
        simulated: true,
        error: false,
        questionText: requestData.questionText
      }
    } else {
      result = {
        type: 'unknown',
        message: 'Tipo de mídia não suportado',
        simulated: true,
        error: true,
        questionText: requestData.questionText
      }
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } else {
    return new Response(
      JSON.stringify({
        error: true,
        message: 'Nenhuma mídia fornecida para análise',
        simulated: true
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
