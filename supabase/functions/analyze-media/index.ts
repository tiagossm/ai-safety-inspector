
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
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
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

    const data = await response.json()
    return {
      type: 'image',
      analysis: data.choices[0]?.message?.content || 'Não foi possível analisar a imagem'
    }
  } catch (error) {
    console.error('Error analyzing image:', error)
    return {
      type: 'image',
      analysis: 'Erro ao analisar imagem: ' + error.message
    }
  }
}

// Função para transcrição de áudio usando OpenAI Whisper API
async function transcribeAudio(audioUrl: string, apiKey: string) {
  try {
    // Em um cenário real, precisaríamos baixar o áudio e enviá-lo para a API do Whisper
    // Por simplicidade, simularemos uma resposta
    return {
      type: 'audio',
      transcription: 'Esta é uma transcrição simulada de áudio. Em um ambiente de produção, utilizaríamos a API Whisper do OpenAI para transcrição real.'
    }
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return {
      type: 'audio',
      transcription: 'Erro ao transcrever áudio: ' + error.message
    }
  }
}

// Função para análise de vídeo (um frame) usando OpenAI Vision
async function analyzeVideoFrame(videoUrl: string, apiKey: string) {
  try {
    // Em um cenário real, extrairíamos um frame do vídeo e o analisaríamos
    // Por simplicidade, simularemos uma resposta
    return {
      type: 'video',
      analysis: 'Esta é uma análise simulada de vídeo. Em um ambiente de produção, extrairíamos frames do vídeo e os analisaríamos usando a API Vision do OpenAI.'
    }
  } catch (error) {
    console.error('Error analyzing video:', error)
    return {
      type: 'video',
      analysis: 'Erro ao analisar vídeo: ' + error.message
    }
  }
}

// Função para simular análise quando não temos API key
function simulateAnalysis(mediaUrl: string, mediaType: string, corsHeaders: any) {
  let result
  
  if (mediaType.startsWith('image/')) {
    result = {
      type: 'image',
      analysis: 'Esta é uma análise simulada de imagem. Configure a API do OpenAI para obter análises reais.'
    }
  } else if (mediaType.startsWith('audio/')) {
    result = {
      type: 'audio',
      transcription: 'Esta é uma transcrição simulada de áudio. Configure a API do OpenAI para obter transcrições reais.'
    }
  } else if (mediaType.startsWith('video/')) {
    result = {
      type: 'video',
      analysis: 'Esta é uma análise simulada de vídeo. Configure a API do OpenAI para obter análises reais.'
    }
  } else {
    result = {
      type: 'unknown',
      message: 'Tipo de mídia não suportado'
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
