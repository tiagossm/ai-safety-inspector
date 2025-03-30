
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
      console.error('Erro da API ReceitaWS:', data.message)
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
      
      // Preparar todas as possíveis variações do CNAE para aumentar chances de encontrar
      const cnaeLookups = [
        formattedCnae,                           // XXXX-X (formato padrão)
        formattedCnae.replace('-', ''),          // XXXXX (sem hífen)
        formattedCnae.slice(0, 4),               // XXXX (primeiros 4 dígitos)
        formattedCnae.slice(0, 2)                // XX (primeiros 2 dígitos - grupo econômico)
      ];
      
      console.log('Tentando buscar com as seguintes variações de CNAE:', cnaeLookups);
      let foundMatch = false;
      
      // Tenta cada formato em sequência até encontrar
      for (const cnaeFormat of cnaeLookups) {
        if (!cnaeFormat) continue;
        
        console.log('Tentando buscar com CNAE:', cnaeFormat);
        
        const { data: riskData, error } = await supabase
          .from('nr4_riscos')
          .select('grau_risco')
          .eq('cnae', cnaeFormat)
          .maybeSingle();

        if (error) {
          console.error(`Erro ao consultar grau de risco para ${cnaeFormat}:`, error);
          continue;
        }
        
        if (riskData) {
          riskLevel = riskData.grau_risco.toString();
          console.log(`Grau de risco encontrado para ${cnaeFormat}:`, riskLevel);
          foundMatch = true;
          break;
        } else {
          console.log(`Nenhum resultado exato encontrado para ${cnaeFormat}`);
        }
      }
      
      // Se ainda não encontrou, tenta uma busca parcial (LIKE)
      if (!foundMatch) {
        console.log('Tentando busca parcial com LIKE');
        const cnaeDigits = formattedCnae.replace(/\D/g, '');
        
        if (cnaeDigits.length >= 2) {
          // Tenta com os primeiros 2 dígitos (grupo econômico)
          const firstTwoDigits = cnaeDigits.slice(0, 2);
          console.log(`Tentando busca parcial com os primeiros 2 dígitos: ${firstTwoDigits}`);
          
          const { data: riskData, error } = await supabase
            .from('nr4_riscos')
            .select('grau_risco')
            .like('cnae', `${firstTwoDigits}%`)
            .limit(1);
            
          if (error) {
            console.error('Erro ao fazer busca parcial:', error);
          } else if (riskData && riskData.length > 0) {
            riskLevel = riskData[0].grau_risco.toString();
            console.log('Grau de risco encontrado com busca parcial pelos primeiros 2 dígitos:', riskLevel);
            foundMatch = true;
          }
        }
        
        // Se ainda não encontrou e temos pelo menos 4 dígitos, tenta com os primeiros 4
        if (!foundMatch && cnaeDigits.length >= 4) {
          const firstFourDigits = cnaeDigits.slice(0, 4);
          console.log(`Tentando busca parcial com os primeiros 4 dígitos: ${firstFourDigits}`);
          
          const { data: riskData, error } = await supabase
            .from('nr4_riscos')
            .select('grau_risco')
            .like('cnae', `${firstFourDigits}%`)
            .limit(1);
            
          if (error) {
            console.error('Erro ao fazer busca parcial com 4 dígitos:', error);
          } else if (riskData && riskData.length > 0) {
            riskLevel = riskData[0].grau_risco.toString();
            console.log('Grau de risco encontrado com busca parcial pelos primeiros 4 dígitos:', riskLevel);
            foundMatch = true;
          }
        }
      }
      
      // Se ainda não temos o grau de risco, define como 1 (padrão/menor risco)
      if (!riskLevel) {
        console.log('Nenhum grau de risco encontrado para o CNAE. Definindo como padrão (1).');
        riskLevel = "1";
      }
    } else {
      console.log('CNAE não disponível. Definindo grau de risco como padrão (1).');
      riskLevel = "1";
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

    console.log('Dados formatados para retorno:', formattedData)

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
      JSON.stringify({ error: error.message || "Erro desconhecido" }),
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
