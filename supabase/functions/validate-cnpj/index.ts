
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    // Calcula o grau de risco baseado no CNAE
    const cnae = data.atividade_principal[0].code
    let riskLevel = '1'

    // Consulta o grau de risco no banco de dados
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: riskData, error: riskError } = await supabase
      .from('risk_levels')
      .select('risk_level')
      .eq('cnae', cnae)
      .single()

    if (!riskError && riskData) {
      riskLevel = riskData.risk_level
    }

    const companyData = {
      cnpj: cleanCNPJ,
      fantasy_name: data.fantasia || data.nome,
      cnae: data.atividade_principal[0].code,
      risk_level: riskLevel,
      contact_email: data.email,
      contact_phone: data.telefone,
      contact_name: data.qsa?.[0]?.nome,
    }

    return new Response(
      JSON.stringify(companyData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
