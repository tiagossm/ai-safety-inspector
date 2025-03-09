
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to generate mock questions (until we connect with an actual AI service)
function generateQuestions(prompt: string, numQuestions: number, category: string) {
  const questions = [];
  
  // Define question templates by category
  const questionTemplates: Record<string, string[]> = {
    'safety': [
      "Os equipamentos de proteção individual (EPI) estão sendo utilizados corretamente?",
      "Existem extintores de incêndio em todos os locais necessários?",
      "As rotas de evacuação estão devidamente sinalizadas?",
      "Os funcionários receberam treinamento adequado para emergências?",
      "Os equipamentos elétricos possuem aterramento adequado?",
      "As áreas de risco estão devidamente sinalizadas?",
      "Há procedimentos claros para trabalho em altura?",
      "Os produtos químicos estão armazenados conforme normas de segurança?",
      "As instalações estão livres de vazamentos ou danos estruturais?",
      "Há kit de primeiros socorros disponível e bem abastecido?",
    ],
    'quality': [
      "Os produtos atendem às especificações técnicas?",
      "Existe um sistema de controle de qualidade implementado?",
      "Os instrumentos de medição estão calibrados?",
      "São realizadas inspeções periódicas nos produtos finais?",
      "O sistema de rastreabilidade está funcionando corretamente?",
      "As não conformidades são registradas e tratadas adequadamente?",
      "O processo produtivo segue os padrões de qualidade estabelecidos?",
      "Há indicadores de qualidade monitorados regularmente?",
      "Os colaboradores recebem treinamento sobre qualidade?",
      "A documentação técnica está atualizada e disponível?",
    ],
    'maintenance': [
      "Os equipamentos receberam manutenção preventiva conforme cronograma?",
      "Há registro de manutenções corretivas recentes?",
      "As peças de reposição estão disponíveis em estoque?",
      "Os manuais técnicos estão acessíveis aos técnicos?",
      "Os equipamentos apresentam ruídos ou vibrações anormais?",
      "Foi realizada limpeza técnica nos equipamentos?",
      "Os sistemas hidráulicos apresentam vazamentos?",
      "As conexões elétricas estão em bom estado?",
      "Os sistemas de lubrificação estão funcionando adequadamente?",
      "As ferramentas de manutenção estão organizadas e em bom estado?",
    ],
    'environment': [
      "Os resíduos são separados corretamente?",
      "Existe um sistema de tratamento de efluentes?",
      "As licenças ambientais estão em dia?",
      "Há medidas para redução de consumo de água?",
      "São implementadas práticas de economia de energia?",
      "Existem procedimentos para emergências ambientais?",
      "As emissões atmosféricas são monitoradas?",
      "Os produtos químicos possuem fichas de segurança (FISPQ)?",
      "Há um programa de educação ambiental para colaboradores?",
      "Os fornecedores seguem critérios ambientais?",
    ],
    'operational': [
      "Os procedimentos operacionais padrão (POPs) estão disponíveis?",
      "Os funcionários seguem as instruções de trabalho?",
      "A produtividade está dentro das metas estabelecidas?",
      "Há registros de paradas não programadas?",
      "O fluxo de materiais está otimizado?",
      "Os equipamentos operam nas condições especificadas?",
      "Os parâmetros de processo são controlados e registrados?",
      "A gestão visual (quadros, sinalizações) está implementada?",
      "O layout da operação facilita a movimentação e controle?",
      "Os tempos de setup estão dentro do planejado?",
    ]
  };
  
  // Default to general if category doesn't exist
  const categoryQuestions = questionTemplates[category] || questionTemplates['safety'];
  
  // Use prompt to tailor some questions
  const keywords = prompt.toLowerCase().split(' ');
  
  for (let i = 0; i < numQuestions; i++) {
    // Use template questions for most, but customize some based on the prompt
    if (i < categoryQuestions.length) {
      questions.push({
        pergunta: categoryQuestions[i],
        tipo_resposta: "sim/não",
        obrigatorio: true,
        ordem: i + 1
      });
    } else {
      // Generate additional questions based on the prompt
      const customQuestion = `Verificar condições de ${keywords[i % keywords.length] || 'segurança'} ${
        keywords[(i + 1) % keywords.length] ? 'relacionadas a ' + keywords[(i + 1) % keywords.length] : ''
      }`;
      
      // Alternate question types for variety
      const questionTypes = ["sim/não", "texto", "numérico", "foto", "seleção múltipla"];
      const selectedType = questionTypes[i % questionTypes.length];
      
      // Add options for multiple choice questions
      let opcoes = null;
      if (selectedType === "seleção múltipla") {
        opcoes = ["Conforme", "Não conforme", "Não aplicável", "Requer atenção"];
      }
      
      questions.push({
        pergunta: customQuestion,
        tipo_resposta: selectedType,
        obrigatorio: Math.random() > 0.3, // 70% chance of being required
        ordem: i + 1,
        opcoes: opcoes
      });
    }
  }
  
  return questions;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get request params
    const { prompt, num_questions, category, user_id, company_id } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Generating checklist for prompt: ${prompt}, questions: ${num_questions}, category: ${category}`);

    // If company_id is not provided but user_id is, try to get the company_id from the user
    let effectiveCompanyId = company_id;
    if (!effectiveCompanyId && user_id) {
      try {
        const { data: userData, error: userError } = await supabaseClient
          .from('users')
          .select('company_id')
          .eq('id', user_id)
          .single();
          
        if (!userError && userData?.company_id) {
          effectiveCompanyId = userData.company_id;
          console.log("Retrieved company_id from user:", effectiveCompanyId);
        }
      } catch (error) {
        console.error("Error fetching user's company_id:", error);
      }
    }

    // Generate questions based on the prompt and category
    const questions = generateQuestions(prompt, num_questions || 10, category || 'general');
    
    // In a production environment, this would integrate with OpenAI or another AI service
    // For now we're using the mock generator above
    
    const title = `Checklist de ${category || 'Segurança'}: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`;
    
    // Create actual checklist in the database
    const { data: checklist, error: checklistError } = await supabaseClient
      .from('checklists')
      .insert({
        title: title,
        description: `Checklist gerado automaticamente com base em: ${prompt}`,
        is_template: true,
        status_checklist: 'ativo',
        category: category || 'general',
        user_id: user_id || null,
        company_id: effectiveCompanyId || null
      })
      .select()
      .single();
      
    if (checklistError) {
      console.error("Error creating checklist:", checklistError);
      throw new Error(`Falha ao criar checklist: ${checklistError.message}`);
    }
    
    // Add generated questions to the checklist
    const checklistId = checklist.id;
    let successCount = 0;
    
    for (const question of questions) {
      try {
        const { error } = await supabaseClient
          .from('checklist_itens')
          .insert({
            checklist_id: checklistId,
            pergunta: question.pergunta,
            tipo_resposta: question.tipo_resposta,
            obrigatorio: question.obrigatorio,
            ordem: question.ordem,
            opcoes: question.opcoes
          });
          
        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error("Error adding question:", error);
      }
    }

    // Return the generated checklist data
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          checklist_id: checklistId,
          title: title,
          description: `Checklist gerado automaticamente com base em: ${prompt}`,
          questions_added: successCount,
          questions_total: questions.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message, 
        details: typeof error === 'object' ? JSON.stringify(error) : null 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
