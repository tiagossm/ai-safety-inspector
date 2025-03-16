
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { cnpj } = await req.json()
    
    if (!cnpj) {
      throw new Error('CNPJ é obrigatório')
    }

    // Remove caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/\D/g, '')
    
    console.log('Consultando CNPJ:', cleanCNPJ)

    // Chama a API ReceitaWS
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCNPJ}`)
    const data = await response.json()

    if (data.status === 'ERROR') {
      throw new Error(data.message || 'CNPJ não encontrado')
    }

    console.log('Dados recebidos da ReceitaWS:', data)
    
    // Extrai e formata o CNAE principal
    const cnaeCode = data.atividade_principal?.[0]?.code || ''
    const formattedCnae = cnaeCode.replace(/[^\d]/g, '').length >= 5 
      ? `${cnaeCode.replace(/[^\d]/g, '').slice(0, 4)}-${cnaeCode.replace(/[^\d]/g, '').slice(4, 5)}` 
      : `${cnaeCode.replace(/[^\d]/g, '').padEnd(4, '0')}-0`;
      
    // Busca o grau de risco no Supabase
    let riskLevel = '';
    
    try {
      // Initialize the Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      console.log('Buscando grau de risco para CNAE:', formattedCnae);
      
      const { data: riskData, error } = await supabase
        .from('nr4_riscos')
        .select('grau_risco')
        .eq('cnae', formattedCnae)
        .maybeSingle();
        
      if (error) {
        console.error('Erro ao buscar grau de risco:', error);
      } else if (riskData) {
        riskLevel = riskData.grau_risco.toString();
        console.log('Grau de risco encontrado:', riskLevel);
      } else {
        // If no exact match, try without hyphen
        const cnaeNoHyphen = formattedCnae.replace('-', '');
        console.log('Tentando buscar sem hífen:', cnaeNoHyphen);
        
        const { data: dataAlt, error: errorAlt } = await supabase
          .from('nr4_riscos')
          .select('grau_risco')
          .or(`cnae.eq.${cnaeNoHyphen},cnae.eq.${formattedCnae}`)
          .maybeSingle();
          
        if (errorAlt) {
          console.error('Erro na busca alternativa:', errorAlt);
        } else if (dataAlt) {
          riskLevel = dataAlt.grau_risco.toString();
          console.log('Grau de risco encontrado (busca alternativa):', riskLevel);
        } else {
          console.log('CNAE não encontrado na tabela nr4_riscos');
        }
      }
    } catch (error) {
      console.error('Erro ao consultar tabela de riscos:', error);
    }
    
    // Formata o endereço
    const address = data.logradouro ? 
      `${data.logradouro}, ${data.numero}${data.complemento ? `, ${data.complemento}` : ''}, ${data.bairro}, ${data.municipio}, ${data.uf}, ${data.cep}` : 
      '';

    // Formata os dados para retornar
    const formattedData = {
      fantasyName: data.fantasia || data.nome,
      cnae: formattedCnae,
      riskLevel: riskLevel,
      address: address,
      contactEmail: data.email || '',
      contactPhone: data.telefone || '',
      contactName: data.qsa?.[0]?.nome || ''
    }

    console.log('Dados formatados:', formattedData)

    return new Response(
      JSON.stringify(formattedData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Erro na consulta do CNPJ:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 400 
      }
    )
  }
})
