
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

import { corsHeaders, handleCors } from './corsUtils.ts';
import { parseCSV, validateCSVData } from './csvParser.ts';
import { createChecklist, ChecklistFormData } from './checklistCreator.ts';
import { processChecklistItem } from './checklistItemProcessor.ts';
import { validateFile } from './fileValidator.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log("Starting process-checklist-csv function");
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Parse form data with file
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const formJson = formData.get('form') as string;
    
    console.log("Received file:", file?.name);
    console.log("Received form data:", formJson);
    
    // Validate the file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      throw new Error(fileValidation.message);
    }
    
    // Parse form data
    const form = JSON.parse(formJson || '{}') as ChecklistFormData;
    console.log("Parsed form data:", form);
    
    // Get file content
    const text = await file.text();
    console.log(`File content preview: ${text.substring(0, 200)}...`);
    
    // Parse CSV file and validate
    const rows = parseCSV(text, { skipFirstRow: true });
    console.log(`Processing ${rows.length} rows from file: ${file.name}`);
    
    const csvValidation = validateCSVData(rows);
    if (!csvValidation.valid) {
      throw new Error(csvValidation.message);
    }
    
    // Create checklist
    const { id: checklistId } = await createChecklist(supabaseClient, form, file.name);
    
    // Process the CSV rows and create checklist items
    let processed = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        
        // Skip empty rows
        if (!row.length || row.every(cell => !cell || cell.trim() === '')) {
          console.log(`Skipping empty row ${i + 1}`);
          continue;
        }
        
        console.log(`Processing row ${i + 1}:`, row);
        
        await processChecklistItem(supabaseClient, checklistId, row, i);
        processed++;
        
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push({ row: i + 1, error: error.message });
      }
    }

    console.log(`Completed processing with ${processed} successful items and ${errors.length} errors`);
    
    // Return a detailed response with the results
    return new Response(
      JSON.stringify({
        success: true,
        message: `Checklist criado com ${processed} itens`,
        checklist_id: checklistId,
        id: checklistId, // Added for backward compatibility
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
