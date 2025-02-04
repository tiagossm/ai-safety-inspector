import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { cnpj } = await req.json()
    
    if (!cnpj) {
      throw new Error('CNPJ is required')
    }

    // Remove non-numeric characters
    const cleanCNPJ = cnpj.replace(/\D/g, '')
    
    // Call ReceitaWS API
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCNPJ}`)
    const data = await response.json()

    if (data.status === 'ERROR') {
      throw new Error(data.message)
    }

    // Calculate risk level based on CNAE (simplified example)
    const riskLevel = calculateRiskLevel(data.atividade_principal[0].code)

    const companyData = {
      cnpj: cleanCNPJ,
      fantasy_name: data.fantasia || data.nome,
      cnae: data.atividade_principal[0].code,
      risk_level: riskLevel,
      contact_email: data.email,
      contact_phone: data.telefone,
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

function calculateRiskLevel(cnae: string): string {
  // This is a simplified example. In a real application,
  // you would have a more comprehensive mapping of CNAE codes to risk levels
  const firstDigit = parseInt(cnae[0])
  if (firstDigit <= 2) return 'Baixo'
  if (firstDigit <= 4) return 'Médio'
  return 'Alto'
}