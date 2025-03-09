
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
    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create templates bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(
      'templates', 
      { 
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
      }
    );

    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError;
    }

    console.log("Templates bucket is ready:", bucketData || "bucket already exists");

    // Create basic template file content if it doesn't exist
    // Create simple template for XLSX
    const templateContent = `Pergunta,Tipo de Resposta,Obrigatório,Ordem,Opções,Permite Áudio,Permite Vídeo,Permite Foto
Equipamentos de proteção individual (EPI) estão sendo utilizados?,yes_no,sim,1,,sim,sim,sim
Local de trabalho está limpo e organizado?,yes_no,sim,2,,não,não,sim
Ferramentas e equipamentos estão em boas condições?,yes_no,sim,3,,não,não,sim
Observações adicionais,text_area,não,4,,não,não,não
Fotos do local,file_upload,sim,5,,não,não,sim
Data da verificação,date,sim,6,,não,não,não`;

    // Check if the template file exists
    const { data: fileExists } = await supabase.storage
      .from('templates')
      .list('', { search: 'checklist_import_template.csv' });

    if (!fileExists || fileExists.length === 0) {
      // Upload the template file
      const { error: uploadError } = await supabase.storage
        .from('templates')
        .upload('checklist_import_template.csv', new Blob([templateContent], { type: 'text/csv' }), {
          contentType: 'text/csv',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      console.log("Template CSV file uploaded successfully");
    } else {
      console.log("Template CSV file already exists");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Templates storage bucket and files created successfully",
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error setting up templates:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
