
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
    
    // Properly detect and handle different CSV formats
    const hasHeader = true; // Assume CSV has headers
    const rows = parse(text, { skipFirstRow: hasHeader });
    
    console.log(`Processing ${rows.length} rows from file: ${file.name}`);
    console.log('Form data:', form);

    // Validate the file has the expected format before processing
    if (rows.length === 0) {
      throw new Error('O arquivo está vazio ou não contém dados válidos');
    }

    // Create checklist
    const { data: checklist, error: checklistError } = await supabaseClient
      .from('checklists')
      .insert({
        title: form.title || file.name.replace(/\.[^/.]+$/, ""),
        description: form.description || `Importado de ${file.name}`,
        is_template: form.is_template || false,
        status_checklist: 'ativo',
        category: form.category || 'general',
        responsible_id: form.responsible_id || null,
        user_id: form.user_id || null,
        company_id: form.company_id || null
      })
      .select()
      .single();

    if (checklistError) {
      console.error('Error creating checklist:', checklistError);
      throw checklistError;
    }

    const checklistId = checklist.id;
    
    // Process the CSV rows and create checklist items
    let processed = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        
        // Skip empty rows
        if (!row.length || row.every(cell => !cell || cell.trim() === '')) {
          continue;
        }
        
        // Expected CSV format: pergunta, tipo_resposta, obrigatorio, opcoes (optional)
        const pergunta = row[0]?.trim() || '';
        
        // Map different type names to standard ones
        let tipoResposta = (row[1]?.trim() || 'sim/não').toLowerCase();
        // Normalize response types
        if (tipoResposta.includes('sim') || tipoResposta.includes('não') || tipoResposta.includes('nao')) {
          tipoResposta = 'sim/não';
        } else if (tipoResposta.includes('mult') || tipoResposta.includes('escolha')) {
          tipoResposta = 'seleção múltipla';
        } else if (tipoResposta.includes('num')) {
          tipoResposta = 'numérico';
        } else if (tipoResposta.includes('text')) {
          tipoResposta = 'texto';
        } else if (tipoResposta.includes('foto') || tipoResposta.includes('imagem')) {
          tipoResposta = 'foto';
        } else if (tipoResposta.includes('assin')) {
          tipoResposta = 'assinatura';
        }
        
        // Parse required field
        let obrigatorio = true;
        if (row[2] !== undefined) {
          const reqField = row[2].toString().toLowerCase().trim();
          obrigatorio = !(reqField === 'não' || reqField === 'nao' || reqField === 'false' || reqField === '0' || reqField === 'n');
        }
        
        // Parse options for multiple choice questions
        let opcoes = null;
        if (tipoResposta === 'seleção múltipla' && row[3]) {
          try {
            if (typeof row[3] === 'string') {
              // Split by comma, semicolon, or pipe
              opcoes = row[3].split(/[,;|]/).map(opt => opt.trim()).filter(opt => opt);
            } else {
              opcoes = [String(row[3])];
            }
          } catch (e) {
            console.error(`Error parsing options for row ${i + 1}:`, e);
            opcoes = [];
          }
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

        if (itemError) {
          console.error(`Error inserting item at row ${i + 1}:`, itemError);
          throw itemError;
        }
        
        processed++;
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push({ row: i + 1, error: error.message });
      }
    }

    // Return a detailed response with the results
    return new Response(
      JSON.stringify({
        success: true,
        message: `Checklist criado com ${processed} itens`,
        checklist_id: checklistId,
        processed_items: processed,
        total_rows: rows.length,
        errors: errors.length > 0 ? errors : null
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: typeof error === 'object' ? JSON.stringify(error) : null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
