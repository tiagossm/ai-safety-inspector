
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Interface for the expected body content
interface RequestBody {
  mediaUrl: string;
  mediaType: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestData: RequestBody = await req.json()
    const { mediaUrl, mediaType } = requestData

    if (!mediaUrl) {
      throw new Error('URL da mídia não fornecida')
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openaiApiKey) {
      console.warn('OpenAI API Key não configurada, usando análise simulada')
      return simulateAnalysis(mediaUrl, mediaType, corsHeaders)
    }

    // Determinar o tipo de mídia baseado no mime type ou extensão
    let result
    if (mediaType.startsWith('image/')) {
      result = await analyzeImage(mediaUrl, openaiApiKey)
    } else if (mediaType.startsWith('audio/') || mediaUrl.endsWith('.webm') || mediaUrl.includes('audio')) {
      // Incluindo webm para lidar com gravações de áudio em formato webm
      result = await transcribeAudio(mediaUrl, openaiApiKey)
    } else if (mediaType.startsWith('video/')) {
      // Para vídeo, vamos analisar um frame como imagem
      result = await analyzeVideoAsImage(mediaUrl, openaiApiKey)
    } else {
      throw new Error(`Tipo de mídia não suportado: ${mediaType}`)
    }

    // Registrar resultado para debug
    console.log("Análise concluída com sucesso:", JSON.stringify(result).substring(0, 200) + "...")

    // Retornar os resultados da análise com cabeçalhos CORS
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    
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
    )
  }
})

// Função para análise de imagem usando OpenAI Vision
async function analyzeImage(imageUrl: string, apiKey: string) {
  try {
    console.log("Analisando imagem:", imageUrl);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Usando o modelo mais recente gpt-4o
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em segurança e inspeção. Analise a imagem em detalhe, identificando possíveis riscos, problemas de segurança ou situações que requerem atenção. Seja detalhado e específico.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Descreva esta imagem em detalhes, identificando possíveis problemas de segurança ou manutenção visíveis.'
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
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro na resposta da OpenAI:", errorData);
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorData}`);
    }

    const data = await response.json()
    
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
    
    return {
      type: 'image',
      analysis: analysis,
      error: false
    }
  } catch (error) {
    console.error('Error analyzing image:', error)
    return {
      type: 'image',
      analysis: 'Erro ao analisar imagem: ' + error.message,
      error: true
    }
  }
}

// Função para analisar vídeo tratando como imagem
async function analyzeVideoAsImage(videoUrl: string, apiKey: string) {
  try {
    console.log("Analisando vídeo como imagem:", videoUrl);
    
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
            content: 'Você é um especialista em segurança e inspeção. Analise o vídeo/frame em detalhe, identificando possíveis riscos ou situações que requerem atenção.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Descreva o que você consegue ver neste vídeo/frame, identificando possíveis problemas de segurança ou manutenção visíveis.'
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
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na resposta da OpenAI: ${response.status} - ${errorText}`);
      
      // Se não conseguir analisar como imagem, fornecer uma resposta simulada
      return {
        type: 'video',
        analysis: 'Foi detectado um vídeo. A análise de conteúdo de vídeo está disponível através da visualização dos frames. Recomendamos analisar visualmente o conteúdo.',
        error: false
      };
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Formato de resposta da OpenAI inesperado");
    }
    
    const analysis = data.choices[0]?.message?.content;
    
    return {
      type: 'video',
      analysis: analysis || 'Análise de vídeo concluída',
      error: false
    }
  } catch (error) {
    console.error('Error analyzing video:', error);
    return {
      type: 'video',
      analysis: 'Este é um vídeo. A análise detalhada não está disponível neste momento. Recomendamos revisar o conteúdo manualmente.',
      error: false
    }
  }
}

// Função para transcrição de áudio usando OpenAI Whisper API
async function transcribeAudio(audioUrl: string, apiKey: string) {
  try {
    console.log("Transcrevendo áudio:", audioUrl);
    
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
    
    // Após transcrição, podemos opcionalmente analisar o conteúdo com a API GPT
    let analysis = '';
    try {
      if (transcriptionData.text && transcriptionData.text.trim() !== '') {
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
                content: 'Você é um especialista em segurança e inspeção. Analise a transcrição do áudio e identifique informações importantes relacionadas a inspeções, segurança ou manutenção.'
              },
              {
                role: 'user',
                content: `Analise esta transcrição de áudio de uma inspeção: ${transcriptionData.text}`
              }
            ],
            max_tokens: 300
          })
        });
        
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          analysis = analysisData.choices?.[0]?.message?.content || '';
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
      error: false
    }
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return {
      type: 'audio',
      transcription: 'Erro ao transcrever áudio: ' + error.message,
      analysis: 'Não foi possível analisar o conteúdo devido a um erro na transcrição',
      error: true
    }
  }
}

// Função para simular análise quando não temos API key
function simulateAnalysis(mediaUrl: string, mediaType: string, corsHeaders: any) {
  let result;
  
  if (mediaType.startsWith('image/')) {
    result = {
      type: 'image',
      analysis: 'Esta é uma análise simulada de imagem. Configure a API do OpenAI na função edge analyze-media para obter análises reais utilizando inteligência artificial.',
      simulated: true,
      error: false
    }
  } else if (mediaType.startsWith('audio/') || mediaUrl.endsWith('.webm') || mediaUrl.includes('audio')) {
    result = {
      type: 'audio',
      transcription: 'Esta é uma transcrição simulada de áudio. Configure a API do OpenAI na função edge analyze-media para obter transcrições reais utilizando a tecnologia Whisper AI.',
      analysis: 'Análise simulada do conteúdo de áudio.',
      simulated: true,
      error: false
    }
  } else if (mediaType.startsWith('video/')) {
    result = {
      type: 'video',
      analysis: 'Esta é uma análise simulada de vídeo. Configure a API do OpenAI na função edge analyze-media para obter análises reais utilizando inteligência artificial.',
      simulated: true,
      error: false
    }
  } else {
    result = {
      type: 'unknown',
      message: 'Tipo de mídia não suportado',
      simulated: true,
      error: true
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
  )
}
