
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers for browser access
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
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    // Fetch assistants from OpenAI
    const response = await fetch("https://api.openai.com/v1/assistants?limit=100", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "assistants=v1"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch assistants: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const assistants = await response.json();
    console.log(`Retrieved ${assistants.data.length} OpenAI assistants`);

    return new Response(
      JSON.stringify({ 
        assistants: assistants.data.map((assistant: any) => ({
          id: assistant.id,
          name: assistant.name || "Assistente sem nome",
          description: assistant.description,
          model: assistant.model
        }))
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error(`Error in list-assistants function:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to list assistants",
        assistants: []
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
