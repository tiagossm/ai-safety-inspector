
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, context, existingQuestions, count = 3, language = 'pt-BR' } = await req.json();

    if (!category) {
      throw new Error('Categoria é obrigatória');
    }

    const systemPrompt = `Você é um especialista em criação de checklists de inspeção e segurança. 
Gere perguntas inteligentes e relevantes para checklists de "${category}".

Contexto adicional: ${context}

Perguntas já existentes no checklist:
${existingQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

Regras importantes:
1. NÃO repita perguntas que já existem
2. Perguntas devem ser claras, específicas e objetivas
3. Foque em aspectos práticos de inspeção
4. Inclua perguntas sobre segurança quando relevante
5. Considere diferentes tipos de resposta (sim/não, múltipla escolha, texto, número)
6. Forneça dicas úteis para o inspetor
7. Responda em ${language}

Para cada pergunta, retorne um JSON com:
- id: string único
- text: texto da pergunta
- responseType: tipo de resposta (yes_no, multiple_choice, text, number, etc.)
- hint: dica opcional para o inspetor
- options: array de opções (se aplicável)
- reasoning: explicação de por que esta pergunta é importante
- confidence: número entre 0 e 1 indicando confiança na relevância`;

    const userPrompt = `Gere ${count} perguntas para um checklist de "${category}". 
Retorne um array JSON válido com as perguntas seguindo o formato especificado.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    let suggestions;
    try {
      suggestions = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      // Tentar extrair JSON do texto
      const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Não foi possível extrair JSON válido da resposta da IA');
      }
    }

    // Validar e normalizar sugestões
    const validSuggestions = suggestions
      .filter((s: any) => s.text && s.responseType)
      .map((s: any, index: number) => ({
        id: s.id || `suggestion-${Date.now()}-${index}`,
        text: s.text,
        responseType: s.responseType,
        hint: s.hint || '',
        options: s.options || [],
        reasoning: s.reasoning || 'Pergunta relevante para a categoria',
        confidence: typeof s.confidence === 'number' ? s.confidence : 0.8
      }))
      .slice(0, count);

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestions: validSuggestions,
        category,
        count: validSuggestions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função generate-question-suggestions:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        suggestions: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
