import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

console.log("Dev Server function inicializada")

serve(async (req) => {
  const { url, method } = req
  
  console.log(`Dev Server: ${method} ${url}`)

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Simular resposta de dev server
    const response = {
      status: 'online',
      environment: 'development',
      timestamp: new Date().toISOString(),
      message: 'Dev Server está funcionando normalmente',
      cors: 'enabled',
      version: '1.0.0'
    }

    console.log('Enviando resposta do dev server:', response)

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Erro no dev server:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Erro interno do servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})