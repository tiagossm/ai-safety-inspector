
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts';

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

    // Parse form data with file
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const formJson = formData.get('form') as string;
    
    if (!file) {
      throw new Error('No file uploaded');
    }
    
    // Parse form data
    const form = JSON.parse(formJson || '{}');
    
    // Get file content
    const text = await file.text();
    const rows = parse(text, { skipFirstRow: true });
    
    console.log(`Processing ${rows.length} rows from file: ${file.name}`);
    console.log('Form data:', form);

    // Create checklist
    const { data: checklist, error: checklistError } = await supabaseClient
      .from('checklists')
      .insert({
        title: form.title || file.name.replace(/\.[^/.]+$/, ""),
        description: form.description || `Importado de ${file.name}`,
        is_template: form.is_template || false,
        status_checklist: 'ativo',
        category: form.category || 'general',
        responsible_id: form.responsible_id || null
      })
      .select()
      .single();

    if (checklistError) {
      throw checklistError;
    }

    const checklistId = checklist.id;
    
    // Process the CSV rows and create checklist items
    let processed = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        
        // Expected CSV format: pergunta, tipo_resposta, obrigatorio, opcoes (optional)
        // Handle different CSV formats
        const pergunta = row[0] || '';
        const tipoResposta = row[1] || 'sim/não';
        const obrigatorio = row[2]?.toLowerCase() === 'sim' || row[2]?.toLowerCase() === 'true' || true;
        let opcoes = null;
        
        // If there are options for multiple choice questions
        if (tipoResposta === 'seleção múltipla' && row[3]) {
          opcoes = row[3].split(',').map((opt: string) => opt.trim());
        }

        if (!pergunta.trim()) {
          continue; // Skip empty questions
        }

        // Create checklist item
        const { error: itemError } = await supabaseClient
          .from('checklist_itens')
          .insert({
            checklist_id: checklistId,
            pergunta,
            tipo_resposta: tipoResposta,
            obrigatorio,
            opcoes,
            ordem: i + 1
          });

        if (itemError) throw itemError;
        processed++;
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push({ row: i + 1, error: error.message });
      }
    }

    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        message: `Checklist criado com ${processed} itens`,
        checklist_id: checklistId,
        processed_items: processed,
        errors: errors.length > 0 ? errors : null
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
