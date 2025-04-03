import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_API_URL = "https://api.openai.com/v1/assistants";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if API key is available
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "OpenAI API key is required. Please set the OPENAI_API_KEY environment variable."
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Make request to OpenAI API to get the list of assistants
    const response = await fetch(OPENAI_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2' // Atualizado de v1 para v2!
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);

      return new Response(
        JSON.stringify({
          error: `OpenAI API error: ${error.error?.message || 'Unknown error'}`
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();

    // Corrigido para retornar no formato esperado
    return new Response(
      JSON.stringify({ assistants: data.data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in list-assistants function:', error);

    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
