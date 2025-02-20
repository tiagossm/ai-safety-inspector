
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

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
    
    // Chama a API ReceitaWS
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCNPJ}`)
    const data = await response.json()

    if (data.status === 'ERROR') {
      throw new Error(data.message || 'CNPJ não encontrado')
    }

    // Formata o CNAE
    const formatCNAE = (cnae: string) => {
      const numbers = cnae.replace(/[^\d]/g, '');
      return numbers.length >= 5 
        ? `${numbers.slice(0, 4)}-${numbers.slice(4, 5)}`
        : `${numbers.padEnd(4, '0')}-0`;
    };

    // Consulta o grau de risco no banco de dados
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const cnae = data.atividade_principal?.[0]?.code;
    const formattedCnae = cnae ? formatCNAE(cnae) : '';

    let riskLevel = '';
    if (formattedCnae) {
      const { data: riskData } = await supabase
        .from('nr4_riscos')
        .select('grau_risco')
        .eq('cnae', formattedCnae)
        .maybeSingle();

      if (riskData) {
        riskLevel = riskData.grau_risco.toString();
      }
    }

    // Formata os dados retornados
    const companyData = {
      cnpj: cleanCNPJ,
      fantasy_name: data.fantasia || data.nome,
      cnae: formattedCnae,
      risk_level: riskLevel,
      email: data.email,
      phone: data.telefone,
      legal_representative: data.qsa?.[0]?.nome,
    }

    console.log('Dados formatados:', companyData);

    return new Response(
      JSON.stringify(companyData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Erro na consulta do CNPJ:', error);
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
