
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

import { corsHeaders, handleCors } from "./corsUtils.ts";
import { generateQuestions, getCompanyIdFromUser } from "./questionGenerator.ts";
import { createChecklist, addQuestionsToChecklist } from "./checklistService.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get request params
    const { prompt, num_questions, category, user_id, company_id } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Generating checklist for prompt: ${prompt}, questions: ${num_questions}, category: ${category}`);

    // If company_id is not provided but user_id is, try to get the company_id from the user
    let effectiveCompanyId = company_id;
    if (!effectiveCompanyId && user_id) {
      effectiveCompanyId = await getCompanyIdFromUser(supabaseClient, user_id);
    }

    // Generate questions based on the prompt and category
    const questions = generateQuestions({
      prompt,
      numQuestions: num_questions || 10,
      category: category || 'general'
    });
    
    const title = `Checklist de ${category || 'Segurança'}: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`;
    
    // Create checklist in the database
    const checklistId = await createChecklist(supabaseClient, {
      title: title,
      description: `Checklist gerado automaticamente com base em: ${prompt}`,
      category: category || 'general',
      user_id: user_id || null,
      company_id: effectiveCompanyId || null
    });
    
    // Add generated questions to the checklist
    const { successCount } = await addQuestionsToChecklist(
      supabaseClient,
      checklistId,
      questions
    );

    // Return the generated checklist data
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          checklist_id: checklistId,
          title: title,
          description: `Checklist gerado automaticamente com base em: ${prompt}`,
          questions_added: successCount,
          questions_total: questions.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message, 
        details: typeof error === 'object' ? JSON.stringify(error) : null 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
