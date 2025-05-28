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
      console.log("OPENAI_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ 
          configured: false,
          error: "API key not configured"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Test the API key with a simple request
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Error testing OpenAI API key:", response.status, errorData);
      
      return new Response(
        JSON.stringify({ 
          configured: false,
          error: `API key invalid: ${response.status} ${response.statusText}`,
          details: errorData
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // API key is valid
    return new Response(
      JSON.stringify({ 
        configured: true,
        message: "OpenAI API configured correctly"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error(`Error in check-openai-config function:`, error);
    
    return new Response(
      JSON.stringify({ 
        configured: false,
        error: error.message || "Failed to check OpenAI configuration"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

