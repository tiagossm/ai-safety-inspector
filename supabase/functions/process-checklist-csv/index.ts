
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
    
    // Create Supabase client with anon key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    // Extract JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Missing authentication" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Create authenticated client with Service Role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the user is authenticated by decoding the JWT
    const jwt = authHeader.replace('Bearer ', '');
    
    // Log the token length for debugging (without exposing the actual token)
    console.log(`JWT token present (length: ${jwt.length})`);
    
    try {
      // Verify the JWT is valid by getting the user
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
      
      if (authError) {
        console.error("Authentication error:", authError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Autenticação falhou: ${authError.message}`,
            code: 401
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      if (!user) {
        console.error("No user found for the provided JWT");
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Autenticação inválida - nenhum usuário encontrado",
            code: 401
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      console.log("User authenticated:", user.id);

      // Check for the expected Content-Type header
      const contentType = req.headers.get('Content-Type') || '';
      console.log("Request Content-Type:", contentType);
      
      // Parse form data with file - make sure to handle potential errors in FormData parsing
      let formData;
      try {
        formData = await req.formData();
      } catch (formDataError) {
        console.error("Error parsing FormData:", formDataError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Erro ao processar dados do formulário. Verifique se está enviando um FormData válido." 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      const file = formData.get('file') as File;
      const formJson = formData.get('form') as string;
      
      if (!file) {
        console.error("No file found in request");
        return new Response(
          JSON.stringify({ success: false, error: "Nenhum arquivo encontrado na requisição" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
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
      
      // Add the authenticated user ID to the form data if not present
      if (!form.user_id) {
        form.user_id = user.id;
        console.log("Added user_id to form:", form.user_id);
      }
      
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
      const { id: checklistId } = await createChecklist(supabaseAdmin, form, file.name);
      
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
          
          await processChecklistItem(supabaseAdmin, checklistId, row, i);
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
    } catch (authError) {
      console.error("JWT Validation error:", authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Autenticação inválida. Talvez sua sessão tenha expirado. Faça login novamente.",
          details: authError.message,
          code: 401
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
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
