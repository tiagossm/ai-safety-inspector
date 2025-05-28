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
          error: "API key not configured",
          assistants: []
        }),
        { 
          status: 200, // Return 200 instead of 400 to avoid breaking the client
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Fetch assistants from OpenAI with error handling and retries
    let retryCount = 0;
    const maxRetries = 2;
    let assistantsData = null;

    while (retryCount <= maxRetries && !assistantsData) {
      try {
        console.log(`Attempt ${retryCount + 1} to fetch OpenAI assistants`);
        
        const response = await fetch("https://api.openai.com/v1/assistants?limit=100", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiApiKey}`,
            "OpenAI-Beta": "assistants=v1"
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
          console.error(`OpenAI API error (${response.status}):`, errorData);
          
          // If we're out of retries, throw the error
          if (retryCount === maxRetries) {
            throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
          }
        } else {
          // Success - parse the response
          const data = await response.json();
          assistantsData = data;
          console.log(`Retrieved ${data.data.length} OpenAI assistants`);
        }
      } catch (fetchError) {
        console.error(`Fetch error on attempt ${retryCount + 1}:`, fetchError);
        
        // If we're out of retries, re-throw the error
        if (retryCount === maxRetries) {
          throw fetchError;
        }
      }
      
      // If we didn't succeed, increment retry counter and wait before trying again
      if (!assistantsData) {
        retryCount++;
        if (retryCount <= maxRetries) {
          // Exponential backoff: 1s, 2s, 4s, etc.
          const waitTime = Math.pow(2, retryCount - 1) * 1000;
          console.log(`Waiting ${waitTime}ms before retry ${retryCount}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // If we have assistants data, return it
    if (assistantsData && assistantsData.data) {
      return new Response(
        JSON.stringify({ 
          assistants: assistantsData.data.map((assistant: any) => ({
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
    } else {
      // This should not happen if our error handling is working correctly
      throw new Error("Failed to retrieve assistants data");
    }
  } catch (error) {
    console.error(`Error in list-assistants function:`, error);
    
    // Always return 200 status with error in the response body
    // This prevents the client from breaking with a 400 error
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to list assistants",
        assistants: []
      }),
      { 
        status: 200, // Return 200 instead of 400
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

