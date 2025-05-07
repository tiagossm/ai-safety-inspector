
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

    // Dependendo do tipo de mídia, fazemos análises diferentes
    let result
    if (mediaType.startsWith('image/')) {
      result = await analyzeImage(mediaUrl, openaiApiKey)
    } else if (mediaType.startsWith('audio/')) {
      result = await transcribeAudio(mediaUrl, openaiApiKey)
    } else if (mediaType.startsWith('video/')) {
      result = await analyzeVideoFrame(mediaUrl, openaiApiKey)
    } else {
      throw new Error('Tipo de mídia não suportado')
    }

    // Registrar resultado para debug
    console.log("Análise concluída com sucesso:", JSON.stringify(result).substring(0, 200) + "...")

    // Retornar os resultados da análise
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
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro desconhecido durante análise de mídia'
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
      analysis: analysis
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
    formData.append('file', audioBlob, 'audio.mp3');
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
      throw new Error(`Erro na API Whisper: ${whisperResponse.status} - ${errorText}`);
    }
    
    const transcriptionData = await whisperResponse.json();
    
    // Após transcrição, podemos opcionalmente analisar o conteúdo com a API GPT
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
    
    let analysis = '';
    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      analysis = analysisData.choices?.[0]?.message?.content || '';
    }
    
    return {
      type: 'audio',
      transcription: transcriptionData.text,
      analysis: analysis
    }
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return {
      type: 'audio',
      transcription: 'Erro ao transcrever áudio: ' + error.message,
      error: true
    }
  }
}

// Função para análise de vídeo (um frame) usando OpenAI Vision
async function analyzeVideoFrame(videoUrl: string, apiKey: string) {
  try {
    console.log("Analisando vídeo:", videoUrl);
    
    // Em um cenário ideal, extrairíamos um frame do vídeo
    // Como isso requer recursos adicionais, vamos usar o thumbnail ou primeiro frame se disponível
    // Ou podemos analisar o vídeo diretamente via URL
    
    // Solução para análise direta do vídeo sem extração de frame
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
            content: 'Você é um especialista em segurança e inspeção. Analise o conteúdo do vídeo e identifique possíveis problemas de segurança ou manutenção.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analise o conteúdo deste vídeo e descreva o que está sendo mostrado. Foque em aspectos relevantes para inspeção e segurança.'
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
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Formato de resposta da OpenAI inesperado");
    }
    
    const analysis = data.choices[0]?.message?.content || 'Não foi possível analisar o vídeo';
    
    return {
      type: 'video',
      analysis
    }
  } catch (error) {
    console.error('Error analyzing video:', error)
    return {
      type: 'video',
      analysis: 'Erro ao analisar vídeo: ' + error.message,
      error: true
    }
  }
}

// Função para simular análise quando não temos API key
function simulateAnalysis(mediaUrl: string, mediaType: string, corsHeaders: any) {
  let result
  
  if (mediaType.startsWith('image/')) {
    result = {
      type: 'image',
      analysis: 'Esta é uma análise simulada de imagem. Configure a API do OpenAI na função edge analyze-media para obter análises reais utilizando inteligência artificial.',
      simulated: true
    }
  } else if (mediaType.startsWith('audio/')) {
    result = {
      type: 'audio',
      transcription: 'Esta é uma transcrição simulada de áudio. Configure a API do OpenAI na função edge analyze-media para obter transcrições reais utilizando a tecnologia Whisper AI.',
      simulated: true
    }
  } else if (mediaType.startsWith('video/')) {
    result = {
      type: 'video',
      analysis: 'Esta é uma análise simulada de vídeo. Configure a API do OpenAI na função edge analyze-media para obter análises reais utilizando inteligência artificial.',
      simulated: true
    }
  } else {
    result = {
      type: 'unknown',
      message: 'Tipo de mídia não suportado',
      simulated: true
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
