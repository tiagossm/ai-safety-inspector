
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { subChecklist, parentQuestionId } = await req.json();

    if (!subChecklist) {
      throw new Error('Sub-checklist é obrigatório');
    }

    if (!parentQuestionId) {
      throw new Error('ID da pergunta pai é obrigatório');
    }

    // 1. Create the new checklist
    const { data: checklistData, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        title: subChecklist.title,
        description: subChecklist.description || `Sub-checklist para pergunta ID: ${parentQuestionId}`,
        is_template: true, // Sub-checklists are treated as templates
        status: 'active',
        category: 'sub-checklist'
      })
      .select('id')
      .single();

    if (checklistError) {
      console.error("Error creating sub-checklist:", checklistError);
      throw checklistError;
    }

    const subChecklistId = checklistData.id;

    // 2. Create all the checklist items in the sub-checklist
    const questionsToInsert = subChecklist.questions.map((q: any, index: number) => ({
      checklist_id: subChecklistId,
      pergunta: q.text,
      tipo_resposta: q.responseType,
      obrigatorio: q.isRequired,
      opcoes: q.responseType === 'multiple_choice' ? q.options : null,
      permite_foto: q.allowsPhoto,
      permite_video: q.allowsVideo,
      permite_audio: q.allowsAudio,
      ordem: index + 1 // 1-based order
    }));

    const { error: itemsError } = await supabase
      .from('checklist_itens')
      .insert(questionsToInsert);

    if (itemsError) {
      console.error("Error creating sub-checklist items:", itemsError);
      throw itemsError;
    }

    // 3. Update the parent question to link to this sub-checklist
    const { error: updateError } = await supabase
      .from('checklist_itens')
      .update({ 
        sub_checklist_id: subChecklistId 
      })
      .eq('id', parentQuestionId);

    if (updateError) {
      console.error("Error updating parent question:", updateError);
      throw updateError;
    }

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      subChecklistId,
      message: 'Sub-checklist criado com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error saving sub-checklist:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Erro ao salvar sub-checklist"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
