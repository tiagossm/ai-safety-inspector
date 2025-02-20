
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    console.log('Fetching assistants from OpenAI...');
    const response = await fetch('https://api.openai.com/v1/assistants', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error response:', error);
      throw new Error(error.error?.message || 'Failed to fetch assistants');
    }

    const data = await response.json();
    console.log('OpenAI API raw response:', data);

    // Garantir que temos uma estrutura válida
    const responseData = {
      data: Array.isArray(data.data) ? data.data : []
    };

    console.log('Formatted response data:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in list-assistants function:', error);
    
    // Sempre retornar um array vazio em caso de erro
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        data: {
          data: [] // Mantém a estrutura esperada mesmo em caso de erro
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
