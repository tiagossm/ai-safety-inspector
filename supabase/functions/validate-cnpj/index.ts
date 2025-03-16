
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    
    // Formata o endereço
    const address = data.logradouro ? 
      `${data.logradouro}, ${data.numero}${data.complemento ? `, ${data.complemento}` : ''}, ${data.bairro}, ${data.municipio}, ${data.uf}, ${data.cep}` : 
      '';

    // Formata os dados para retornar
    const formattedData = {
      fantasyName: data.fantasia || data.nome,
      cnae: data.atividade_principal?.[0]?.code || '',
      riskLevel: '',  // Será preenchido pelo frontend
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
