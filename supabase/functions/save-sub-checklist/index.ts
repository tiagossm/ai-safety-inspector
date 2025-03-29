
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Map standard response types to the types allowed in the database
function mapResponseType(type: string): string {
  const typeMap: Record<string, string> = {
    'yes_no': 'sim/não',
    'multiple_choice': 'seleção múltipla',
    'text': 'texto',
    'numeric': 'numérico',
    'photo': 'foto',
    'signature': 'assinatura'
  };
  
  return typeMap[type] || 'texto';
}

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

    console.log(`Processing sub-checklist for parent question: ${parentQuestionId}`);
    console.log(`Sub-checklist title: ${subChecklist.title}`);
    console.log(`Number of questions: ${subChecklist.questions?.length || 0}`);

    // 1. Create the new checklist
    const { data: checklistData, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        title: subChecklist.title,
        description: subChecklist.description || `Sub-checklist para pergunta ID: ${parentQuestionId}`,
        is_template: true, // Sub-checklists are treated as templates
        status: 'active',
        category: 'sub-checklist', // Special category to identify sub-checklists
        parent_question_id: parentQuestionId // Link to parent question
      })
      .select('id')
      .single();

    if (checklistError) {
      console.error("Error creating sub-checklist:", checklistError);
      throw checklistError;
    }

    const subChecklistId = checklistData.id;
    console.log(`Created sub-checklist with ID: ${subChecklistId}`);

    // 2. Create all the checklist items in the sub-checklist
    if (subChecklist.questions && subChecklist.questions.length > 0) {
      const questionsToInsert = subChecklist.questions.map((q: any, index: number) => {
        // Map the response type to an allowed value
        const tipoResposta = mapResponseType(q.responseType);
        console.log(`Question ${index + 1}: "${q.text?.substring(0, 30)}..." - Type: ${q.responseType} -> ${tipoResposta}`);
        
        return {
          checklist_id: subChecklistId,
          pergunta: q.text,
          tipo_resposta: tipoResposta,
          obrigatorio: q.isRequired,
          opcoes: q.responseType === 'multiple_choice' ? q.options : null,
          permite_foto: q.allowsPhoto,
          permite_video: q.allowsVideo,
          permite_audio: q.allowsAudio,
          ordem: index + 1 // 1-based order
        };
      });

      const { error: itemsError } = await supabase
        .from('checklist_itens')
        .insert(questionsToInsert);

      if (itemsError) {
        console.error("Error creating sub-checklist items:", itemsError);
        throw itemsError;
      }
      
      console.log(`Successfully inserted ${questionsToInsert.length} questions`);
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
    
    console.log(`Successfully linked sub-checklist to parent question ${parentQuestionId}`);

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
