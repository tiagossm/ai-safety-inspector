
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  mediaUrl: string;
  questionText: string;
  questionId: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { mediaUrl, questionText, questionId }: AnalysisRequest = await req.json();

    if (!mediaUrl) {
      return new Response(
        JSON.stringify({
          error: "Missing media URL",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call OpenAI API with the image URL for analysis
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use GPT-4o as it supports vision
        messages: [
          {
            role: "system",
            content: "Você é um especialista em segurança, saúde e meio ambiente que analisa imagens de inspeções de segurança. Forneça comentários detalhados e um plano de ação quando necessário. Seja conciso, específico e útil.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analise esta imagem de inspeção relacionada à seguinte pergunta: "${questionText}". Forneça um comentário detalhado e, se identificar problemas de segurança, sugira um plano de ação.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: mediaUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${data.error?.message || "Unknown error"}`
      );
    }

    // Extract the analysis from OpenAI's response
    const analysisText = data.choices[0].message.content;
    
    // Parse the analysis into comment and action plan
    let comment = "";
    let actionPlan = "";
    
    if (analysisText.includes("Plano de Ação:")) {
      const parts = analysisText.split("Plano de Ação:");
      comment = parts[0].trim();
      actionPlan = parts[1].trim();
    } else {
      comment = analysisText;
    }

    return new Response(
      JSON.stringify({
        analysis: {
          comment,
          actionPlan,
          questionId,
        },
        raw: data,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error analyzing media:", error);
    return new Response(
      JSON.stringify({
        error: `Error analyzing media: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
