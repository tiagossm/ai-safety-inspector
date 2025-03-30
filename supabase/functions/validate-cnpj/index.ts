
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
      
      // Extrai apenas os números do CNAE e o hífen se presente
      const match = cnaeString.match(/(\d{4})-?(\d)/);
      if (match) {
        return `${match[1]}-${match[2]}`;
      }
      
      // Se não encontrar no formato padrão, tenta extrair só os números
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

    // Define nossa função para buscar o grau de risco com fallbacks
    const findRiskLevel = async (formattedCnae) => {
      if (!formattedCnae) return "1"; // Default se não tiver CNAE
      
      // Prepara todas as variações possíveis do CNAE para aumentar chances de encontrar
      const strippedCnae = formattedCnae.replace(/-/g, '');
      const firstFourDigits = formattedCnae.slice(0, 4);
      const firstTwoDigits = formattedCnae.slice(0, 2);
      
      const variations = [
        { format: formattedCnae, type: 'formato padrão XXXX-X' },
        { format: strippedCnae, type: 'formato sem hífen' },
        { format: firstFourDigits, type: 'primeiros 4 dígitos' }
      ];
      
      console.log('Tentando buscar grau de risco com as seguintes variações:', 
        variations.map(v => `${v.format} (${v.type})`).join(', '));
      
      // Tenta cada formato exato
      for (const variation of variations) {
        if (!variation.format) continue;
        
        console.log(`Tentando busca exata com CNAE: ${variation.format} (${variation.type})`);
        
        const { data: exactMatch, error } = await supabase
          .from('nr4_riscos')
          .select('grau_risco')
          .eq('cnae', variation.format)
          .maybeSingle();
          
        if (error) {
          console.error(`Erro ao buscar exato para ${variation.format}:`, error.message);
          continue;
        }
        
        if (exactMatch) {
          console.log(`✅ Encontrado grau de risco para ${variation.format}: ${exactMatch.grau_risco}`);
          return exactMatch.grau_risco.toString();
        }
        
        console.log(`Nenhum resultado exato para ${variation.format}`);
      }
      
      // Se não encontrou correspondência exata, tenta busca com LIKE para os primeiros dígitos
      console.log('Tentando busca parcial com LIKE');
      
      // Tenta com os primeiros 4 dígitos
      if (firstFourDigits) {
        console.log(`Tentando LIKE com primeiros 4 dígitos: ${firstFourDigits}%`);
        
        const { data: likeMatch4, error: likeError4 } = await supabase
          .from('nr4_riscos')
          .select('grau_risco')
          .like('cnae', `${firstFourDigits}%`)
          .order('cnae')
          .limit(1);
          
        if (likeError4) {
          console.error('Erro na busca LIKE com 4 dígitos:', likeError4.message);
        } else if (likeMatch4 && likeMatch4.length > 0) {
          console.log(`✅ Encontrado via LIKE com 4 dígitos: ${likeMatch4[0].grau_risco}`);
          return likeMatch4[0].grau_risco.toString();
        }
      }
      
      // Última tentativa com os primeiros 2 dígitos (grupo econômico)
      if (firstTwoDigits) {
        console.log(`Tentando LIKE com primeiros 2 dígitos: ${firstTwoDigits}%`);
        
        const { data: likeMatch2, error: likeError2 } = await supabase
          .from('nr4_riscos')
          .select('grau_risco')
          .like('cnae', `${firstTwoDigits}%`)
          .order('cnae')
          .limit(1);
          
        if (likeError2) {
          console.error('Erro na busca LIKE com 2 dígitos:', likeError2.message);
        } else if (likeMatch2 && likeMatch2.length > 0) {
          console.log(`✅ Encontrado via LIKE com 2 dígitos: ${likeMatch2[0].grau_risco}`);
          return likeMatch2[0].grau_risco.toString();
        }
      }
      
      // Não encontrou nada, retorna o valor padrão
      console.log('⚠️ Nenhum grau de risco encontrado após todas as tentativas. Retornando padrão (1)');
      return "1";
    };

    // Busca o grau de risco
    const riskLevel = await findRiskLevel(formattedCnae);
    console.log(`Grau de risco final determinado: ${riskLevel}`);

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
