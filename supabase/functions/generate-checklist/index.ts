import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { prompt, num_questions = 10, category = 'general', company_id } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Generating checklist for prompt: ${prompt}, questions: ${num_questions}, category: ${category}`);

    // Generate questions based on the category
    const questions = generateQuestions(prompt, num_questions, category);

    // Insert checklist into the database
    let checklistResult;
    try {
      const { data: checklistData, error: checklistError } = await supabaseClient
        .from("checklists")
        .insert({
          title: `Checklist de ${category}: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
          description: `Checklist gerado automaticamente com base em: ${prompt}`,
          category: category,
          company_id: company_id,
          status_checklist: "ativo",
          is_template: false,
        })
        .select('id')
        .single();

      if (checklistError) {
        console.error("Error creating checklist:", checklistError);
        throw checklistError;
      }
      
      checklistResult = checklistData;
      
      // Insert questions into the database
      if (checklistData && questions.length > 0) {
        const questionsToInsert = questions.map((q, idx) => {
          const dbQuestion: any = {
            checklist_id: checklistData.id,
            pergunta: q.text,
            tipo_resposta: normalizeResponseType(q.type),
            obrigatorio: q.required !== undefined ? q.required : true,
            opcoes: q.options,
            ordem: idx + 1,
          };
          
          return dbQuestion;
        });
        
        const { error: questionsError } = await supabaseClient
          .from("checklist_itens")
          .insert(questionsToInsert);
          
        if (questionsError) {
          console.error("Error inserting questions:", questionsError);
          // Continue execution even if questions fail to insert
        }
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      // Continue execution even if database operations fail
    }

    return new Response(
      JSON.stringify({
        success: true,
        prompt,
        category,
        questions,
        questionCount: questions.length,
        checklist_id: checklistResult?.id || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message, 
        details: typeof error === 'object' ? JSON.stringify(error) : null,
        questions: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Normalize response types according to the database constraints
function normalizeResponseType(type: string): string {
  // Map of user-friendly types to database-compatible types
  const typeMap: Record<string, string> = {
    'yes_no': 'yes_no',
    'sim/não': 'yes_no',
    'multiple_choice': 'multiple_choice',
    'múltipla escolha': 'multiple_choice',
    'numeric': 'numeric',
    'numérico': 'numeric',
    'text': 'text',
    'texto': 'text',
    'photo': 'photo',
    'foto': 'photo',
    'signature': 'signature',
    'assinatura': 'signature'
  };

  return typeMap[type?.toLowerCase()] || 'yes_no'; // Default to 'yes_no' if not matched
}

// Generate questions based on prompt and category
function generateQuestions(prompt: string, numQuestions: number, category: string) {
  const questions = [];
  
  // Define question templates by category
  const questionTemplates: Record<string, { text: string, type: string }[]> = {
    'workplace-safety': [
      { text: "Os equipamentos de proteção individual (EPI) estão sendo utilizados corretamente?", type: "yes_no" },
      { text: "Existem extintores de incêndio em todos os locais necessários?", type: "yes_no" },
      { text: "As rotas de evacuação estão devidamente sinalizadas?", type: "yes_no" },
      { text: "Os funcionários receberam treinamento adequado para emergências?", type: "yes_no" },
      { text: "Os equipamentos elétricos possuem aterramento adequado?", type: "yes_no" },
      { text: "As áreas de risco estão devidamente sinalizadas?", type: "yes_no" },
      { text: "Há procedimentos claros para trabalho em altura?", type: "yes_no" },
      { text: "Os produtos químicos estão armazenados conforme normas de segurança?", type: "yes_no" },
      { text: "As instalações estão livres de vazamentos ou danos estruturais?", type: "yes_no" },
      { text: "Há kit de primeiros socorros disponível e bem abastecido?", type: "yes_no" },
    ],
    'compliance': [
      { text: "Os documentos legais estão atualizados e disponíveis?", type: "yes_no" },
      { text: "Os registros obrigatórios estão sendo mantidos pelo período exigido?", type: "yes_no" },
      { text: "As licenças operacionais estão vigentes?", type: "yes_no" },
      { text: "As obrigações trabalhistas estão sendo cumpridas?", type: "yes_no" },
      { text: "Existem desvios em relação aos procedimentos internos?", type: "yes_no" },
      { text: "As auditorias são realizadas conforme cronograma?", type: "yes_no" },
      { text: "Os planos de ação das não-conformidades estão sendo executados?", type: "yes_no" },
      { text: "Como está a documentação dos processos?", type: "text" },
      { text: "As políticas internas são divulgadas aos colaboradores?", type: "yes_no" },
      { text: "O canal de denúncias está acessível a todos?", type: "yes_no" },
    ],
    'quality': [
      { text: "Os equipamentos de medição estão calibrados?", type: "yes_no" },
      { text: "As amostras são coletadas conforme procedimento?", type: "yes_no" },
      { text: "O controle estatístico de processo é realizado?", type: "yes_no" },
      { text: "As não-conformidades são registradas e tratadas?", type: "yes_no" },
      { text: "Os indicadores de qualidade estão sendo monitorados?", type: "yes_no" },
      { text: "Os insumos são verificados no recebimento?", type: "yes_no" },
      { text: "O produto final atende às especificações?", type: "multiple_choice", options: ["Sim", "Não", "Parcialmente"] },
      { text: "Quais melhorias foram implementadas recentemente?", type: "text" },
      { text: "A rastreabilidade é mantida ao longo do processo?", type: "yes_no" },
      { text: "Os colaboradores recebem treinamento contínuo?", type: "yes_no" },
    ],
    'general': [
      { text: "A documentação está atualizada e organizada?", type: "yes_no" },
      { text: "O ambiente de trabalho está limpo e organizado?", type: "yes_no" },
      { text: "Os colaboradores possuem as ferramentas necessárias?", type: "yes_no" },
      { text: "Os processos estão documentados e acessíveis?", type: "yes_no" },
      { text: "As reuniões de acompanhamento são realizadas periodicamente?", type: "yes_no" },
      { text: "Os recursos estão sendo utilizados de forma eficiente?", type: "multiple_choice", options: ["Sim", "Não", "Parcialmente"] },
      { text: "Os prazos estão sendo cumpridos?", type: "yes_no" },
      { text: "A comunicação entre as equipes é eficaz?", type: "yes_no" },
      { text: "O feedback dos clientes é coletado e analisado?", type: "yes_no" },
      { text: "Os objetivos e metas estão claros para todos?", type: "yes_no" },
    ]
  };
  
  // Get templates for the selected category or use general
  const templates = questionTemplates[category] || questionTemplates.general;
  
  // Use templates up to the number we have
  for (let i = 0; i < Math.min(templates.length, numQuestions); i++) {
    questions.push(templates[i]);
  }
  
  // If we need more questions than templates, generate additional ones based on prompt
  if (numQuestions > templates.length) {
    const keywords = prompt.toLowerCase().split(" ");
    
    // Question types to cycle through
    const questionTypes = ["yes_no", "text", "multiple_choice", "numeric"];
    
    for (let i = templates.length; i < numQuestions; i++) {
      const type = questionTypes[i % questionTypes.length];
      const keyword = keywords[i % keywords.length] || "process";
      
      let question: any = {
        text: generateQuestionText(category, keyword),
        type: type,
        required: Math.random() > 0.3, // 70% chance of being required
      };
      
      // Add options for multiple choice
      if (type === "multiple_choice") {
        if (category === "workplace-safety") {
          question.options = ["Conforme", "Não conforme", "Parcialmente conforme", "Não aplicável"];
        } else if (category === "compliance") {
          question.options = ["Atendido", "Não atendido", "Parcialmente atendido", "Não aplicável"];
        } else if (category === "quality") {
          question.options = ["Aprovado", "Reprovado", "Necessita ajustes", "Não verificado"];
        } else {
          question.options = ["Sim", "Não", "Parcialmente", "Não aplicável"];
        }
      }
      
      questions.push(question);
    }
  }
  
  return questions;
}

// Helper function to generate question text based on category and keyword
function generateQuestionText(category: string, keyword: string): string {
  switch (category) {
    case "workplace-safety":
      return `Verificar condições de segurança relacionadas a ${keyword}`;
    case "compliance":
      return `A documentação relativa a ${keyword} está em conformidade?`;
    case "quality":
      return `O processo de ${keyword} atende aos padrões de qualidade?`;
    default:
      return `Verificar ${keyword} conforme procedimento estabelecido`;
  }
}
