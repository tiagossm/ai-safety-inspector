
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subChecklist, parentQuestionId } = await req.json();

    if (!subChecklist || !parentQuestionId) {
      throw new Error('Sub-checklist data and parent question ID are required');
    }

    console.log("Received parentQuestionId:", parentQuestionId);
    console.log("Received subChecklist:", JSON.stringify(subChecklist).substring(0, 200) + "...");

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL and service role key are required');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create the sub-checklist
    const { data: checklistData, error: checklistError } = await supabase
      .from("checklists")
      .insert({
        title: subChecklist.title,
        description: subChecklist.description,
        is_template: false,
        status_checklist: "ativo",
        status: "active"
      })
      .select("id")
      .single();
    
    if (checklistError) {
      console.error("Error creating sub-checklist:", checklistError);
      throw checklistError;
    }
    
    const subChecklistId = checklistData.id;
    console.log("Created sub-checklist with ID:", subChecklistId);
    
    // Map response types to database format
    const mapResponseType = (type: string): string => {
      const typeMap: Record<string, string> = {
        'yes_no': 'sim/não',
        'text': 'texto',
        'numeric': 'numérico',
        'multiple_choice': 'seleção múltipla'
      };
      
      return typeMap[type] || 'sim/não';
    };
    
    // Insert the questions
    if (subChecklist.questions && subChecklist.questions.length > 0) {
      const questionInserts = subChecklist.questions.map((q: any, index: number) => ({
        checklist_id: subChecklistId,
        pergunta: q.text,
        tipo_resposta: mapResponseType(q.responseType),
        obrigatorio: q.isRequired !== false,
        opcoes: q.responseType === 'multiple_choice' ? q.options : null,
        ordem: index,
        permite_foto: q.allowsPhoto || false,
        permite_video: q.allowsVideo || false,
        permite_audio: q.allowsAudio || false,
        weight: 1
      }));
      
      console.log("Inserting questions:", questionInserts.length);
      
      const { error: insertError } = await supabase
        .from("checklist_itens")
        .insert(questionInserts);
      
      if (insertError) {
        console.error("Error inserting questions:", insertError);
        throw insertError;
      }
    }
    
    // Update the parent question with the sub-checklist ID
    console.log("Updating parent question:", parentQuestionId, "with sub-checklist ID:", subChecklistId);
    const { error: updateError } = await supabase
      .from("checklist_itens")
      .update({
        sub_checklist_id: subChecklistId
      })
      .eq("id", parentQuestionId);
    
    if (updateError) {
      console.error("Error updating parent question:", updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({
      success: true,
      subChecklistId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error saving sub-checklist:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
