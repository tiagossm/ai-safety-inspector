
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log("Fetching assistants from OpenAI API...");
    
    const response = await fetch('https://api.openai.com/v1/assistants?limit=100', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from OpenAI API:', errorText);
      throw new Error(`Error fetching assistants: ${response.status} ${response.statusText}`);
    }

    const assistantsData = await response.json();
    console.log(`Assistants fetched successfully. Found ${assistantsData.data?.length || 0} assistants.`);

    // Return the data with proper headers
    return new Response(
      JSON.stringify({ 
        data: assistantsData.data || [],
        count: assistantsData.data?.length || 0,
        has_more: assistantsData.has_more || false 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in list-assistants function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch assistants' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
