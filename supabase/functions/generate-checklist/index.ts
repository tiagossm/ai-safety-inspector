
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get request params
    const { prompt, num_questions, category } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Generating checklist for prompt: ${prompt}, questions: ${num_questions}, category: ${category}`);

    // Aqui você pode implementar a lógica para gerar o checklist com base no prompt
    // usando integração com OpenAI ou outro serviço de IA
    
    // Por enquanto, vamos simular uma resposta
    const mockQuestions = [];
    for (let i = 1; i <= (num_questions || 10); i++) {
      mockQuestions.push({
        pergunta: `Pergunta ${i} sobre ${prompt}`,
        tipo_resposta: "sim/não",
        obrigatorio: true,
        ordem: i
      });
    }

    // Retorna as perguntas geradas
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          title: `Checklist de ${category || 'Segurança'}: ${prompt.substring(0, 50)}...`,
          description: `Checklist gerado automaticamente com base em: ${prompt}`,
          questions: mockQuestions
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
