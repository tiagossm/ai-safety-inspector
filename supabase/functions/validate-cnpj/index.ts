
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Formata o CNAE para buscar o grau de risco
    const extractCnae = (cnaeString) => {
      if (!cnaeString) return '';
      
      // Extrai apenas os números do CNAE
      const numbers = cnaeString.replace(/[^\d]/g, '');
      
      // Se tiver pelo menos 5 dígitos, formata como XXXX-X
      if (numbers.length >= 5) {
        return `${numbers.slice(0, 4)}-${numbers.slice(4, 5)}`;
      }
      
      // Se tiver menos de 5 dígitos, completa com zeros
      return `${numbers.padEnd(4, '0')}-0`;
    };

    // Pega o CNAE principal
    const cnae = data.atividade_principal?.[0]?.code || '';
    const formattedCnae = extractCnae(cnae);
    
    console.log('CNAE formatado:', formattedCnae);
    
    // Criar cliente Supabase para consultar o grau de risco
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://jkgmgjjtslkozhehwmng.supabase.co';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ21namp0c2xrb3poZWh3bW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjMwNDAsImV4cCI6MjA1NzI5OTA0MH0.VHL_5dontJ5Zin2cPTrQgkdx-CbnqWtRkVq-nNSnAZg';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Buscar grau de risco na tabela nr4_riscos
    let riskLevel = '';
    if (formattedCnae) {
      console.log('Consultando grau de risco para CNAE:', formattedCnae);
      
      const { data: riskData, error } = await supabase
        .from('nr4_riscos')
        .select('grau_risco')
        .eq('cnae', formattedCnae)
        .maybeSingle();

      if (error) {
        console.error('Erro ao consultar grau de risco:', error);
      }
      
      if (riskData) {
        riskLevel = riskData.grau_risco.toString();
        console.log('Grau de risco encontrado:', riskLevel);
      } else {
        console.log('Nenhum grau de risco encontrado para o CNAE:', formattedCnae);
      }
    }

    // Formata os dados para retornar
    const formattedData = {
      fantasyName: data.fantasia || data.nome,
      cnae: formattedCnae,
      riskLevel: riskLevel,
      address: `${data.logradouro}, ${data.numero}${data.complemento ? `, ${data.complemento}` : ''} - ${data.bairro}, ${data.municipio}/${data.uf}`,
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
