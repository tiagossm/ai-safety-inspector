
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cnpj } = await req.json();

    // Remove non-numeric characters
    const cleanCnpj = cnpj.replace(/[^\d]/g, '');
    console.log(`Consultando CNPJ: ${cleanCnpj}`);

    // Call ReceitaWS API
    const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cleanCnpj}`);
    const data = await response.json();
    console.log(`Dados recebidos da ReceitaWS: ${JSON.stringify(data, null, 2)}`);

    // Handle error from ReceitaWS
    if (data.status === 'ERROR') {
      return new Response(
        JSON.stringify({ error: data.message || 'Erro ao consultar CNPJ' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the main CNAE code and format it correctly
    let cnae = '';
    if (data.atividade_principal && data.atividade_principal.length > 0) {
      // Extract the code part (e.g., "17.10-9-00" -> "1710-9")
      const fullCode = data.atividade_principal[0].code;
      // Remove all dots and hyphens first
      const cleanCode = fullCode.replace(/[^\d]/g, '');
      
      // Now format it as XXXX-X (if possible)
      if (cleanCode.length >= 5) {
        cnae = `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 5)}`;
      } else {
        cnae = cleanCode;
      }
    }
    console.log(`CNAE formatado: ${cnae}`);

    // Connect to Supabase to get the risk level from the CNAE
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try different strategies to find the risk level
    console.log(`Tentando buscar grau de risco com as seguintes variações: ${cnae} (formato padrão XXXX-X), ${cnae.replace('-', '')} (formato sem hífen), ${cnae.substring(0, 4)} (primeiros 4 dígitos)`);
    
    let riskLevel = "1"; // Default risk level
    
    // Strategy 1: Try exact match with formatted CNAE (XXXX-X format)
    console.log(`Tentando busca exata com CNAE: ${cnae} (formato padrão XXXX-X)`);
    let { data: riskData, error } = await supabase
      .from('nr4_riscos')
      .select('grau_risco')
      .eq('cnae', cnae)
      .maybeSingle();
      
    if (error) {
      console.log(`Erro ao buscar grau de risco: ${error.message}`);
    }
    
    if (riskData) {
      riskLevel = riskData.grau_risco;
      console.log(`Grau de risco encontrado para ${cnae}: ${riskLevel}`);
    } else {
      console.log(`Nenhum resultado exato para ${cnae}`);
      
      // Strategy 2: Try with CNAE without hyphen
      const cnaeNoHyphen = cnae.replace('-', '');
      console.log(`Tentando busca exata com CNAE: ${cnaeNoHyphen} (formato sem hífen)`);
      
      const { data: riskData2, error: error2 } = await supabase
        .from('nr4_riscos')
        .select('grau_risco')
        .eq('cnae', cnaeNoHyphen)
        .maybeSingle();
        
      if (error2) {
        console.log(`Erro ao buscar grau de risco para ${cnaeNoHyphen}: ${error2.message}`);
      }
      
      if (riskData2) {
        riskLevel = riskData2.grau_risco;
        console.log(`Grau de risco encontrado para ${cnaeNoHyphen}: ${riskLevel}`);
      } else {
        console.log(`Nenhum resultado exato para ${cnaeNoHyphen}`);
        
        // Strategy 3: Try with first 4 digits of CNAE
        const cnaeFirst4 = cnae.substring(0, 4);
        console.log(`Tentando busca exata com CNAE: ${cnaeFirst4} (primeiros 4 dígitos)`);
        
        const { data: riskData3, error: error3 } = await supabase
          .from('nr4_riscos')
          .select('grau_risco')
          .eq('cnae', cnaeFirst4)
          .maybeSingle();
          
        if (error3) {
          console.log(`Erro ao buscar grau de risco para ${cnaeFirst4}: ${error3.message}`);
        }
        
        if (riskData3) {
          riskLevel = riskData3.grau_risco;
          console.log(`Grau de risco encontrado para ${cnaeFirst4}: ${riskLevel}`);
        } else {
          console.log(`Nenhum resultado exato para ${cnaeFirst4}`);
          
          // Strategy 4: Try partial match with LIKE
          console.log(`Tentando busca parcial com LIKE`);
          
          // Try with first 4 digits
          console.log(`Tentando LIKE com primeiros 4 dígitos: ${cnaeFirst4}%`);
          const { data: riskData4, error: error4 } = await supabase
            .from('nr4_riscos')
            .select('grau_risco')
            .like('cnae', `${cnaeFirst4}%`)
            .order('cnae')
            .limit(1);
            
          if (error4) {
            console.log(`Erro ao buscar grau de risco com LIKE ${cnaeFirst4}%: ${error4.message}`);
          }
          
          if (riskData4 && riskData4.length > 0) {
            riskLevel = riskData4[0].grau_risco;
            console.log(`Grau de risco encontrado para LIKE ${cnaeFirst4}%: ${riskLevel}`);
          } else {
            // Try with first 2 digits if all else fails
            const cnaeFirst2 = cnae.substring(0, 2);
            console.log(`Tentando LIKE com primeiros 2 dígitos: ${cnaeFirst2}%`);
            
            const { data: riskData5, error: error5 } = await supabase
              .from('nr4_riscos')
              .select('grau_risco')
              .like('cnae', `${cnaeFirst2}%`)
              .order('cnae')
              .limit(1);
              
            if (error5) {
              console.log(`Erro ao buscar grau de risco com LIKE ${cnaeFirst2}%: ${error5.message}`);
            }
            
            if (riskData5 && riskData5.length > 0) {
              riskLevel = riskData5[0].grau_risco;
              console.log(`Grau de risco encontrado para LIKE ${cnaeFirst2}%: ${riskLevel}`);
            } else {
              console.log(`⚠️ Nenhum grau de risco encontrado após todas as tentativas. Retornando padrão (1)`);
            }
          }
        }
      }
    }
    
    console.log(`Grau de risco final determinado: ${riskLevel}`);

    // Format the response data
    const formattedData = {
      fantasyName: data.nome || data.fantasia || "",
      cnae: cnae,
      riskLevel: riskLevel,
      address: `${data.logradouro || ""}, ${data.numero || ""}, ${data.complemento || ""} - ${data.bairro || ""}, ${data.municipio || ""}/${data.uf || ""}`,
      contactEmail: data.email || "",
      contactPhone: data.telefone || "",
      contactName: data.qsa && data.qsa.length > 0 ? data.qsa[0].nome : ""
    };
    
    console.log(`Dados formatados para retorno: ${JSON.stringify(formattedData, null, 2)}`);

    return new Response(
      JSON.stringify(formattedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in validate-cnpj function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Erro ao processar solicitação: ' + error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
