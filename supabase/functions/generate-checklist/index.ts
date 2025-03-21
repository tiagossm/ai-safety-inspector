
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from environment variables
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    // Parse request body
    const { prompt, questionCount = 5, assistant = 'general', checklistData = {}, assistantId } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Define system message based on assistant type
    let systemMessage = '';
    switch (assistant) {
      case 'workplace-safety':
        systemMessage = 'Você é um especialista em segurança do trabalho. Crie um checklist para inspeções e auditorias de segurança.';
        break;
      case 'compliance':
        systemMessage = 'Você é um especialista em conformidade e regulamentações. Crie um checklist para auditorias de conformidade.';
        break;
      case 'quality':
        systemMessage = 'Você é um especialista em controle de qualidade. Crie um checklist para inspeções e auditorias de qualidade.';
        break;
      default:
        systemMessage = 'Você é um especialista em criação de checklists para diversos fins. Crie um checklist detalhado e abrangente.';
    }

    // Append instructions for output format
    systemMessage += `
Crie um checklist com ${questionCount} perguntas com base no prompt do usuário.
Responda APENAS no formato JSON abaixo, sem texto adicional:

{
  "title": "Título do checklist (extraído do prompt)",
  "description": "Breve descrição do propósito do checklist",
  "questions": [
    {
      "text": "Texto da pergunta 1",
      "type": "yes_no | multiple_choice | text | numeric | photo | signature",
      "required": true | false,
      "options": ["Opção 1", "Opção 2"] (apenas para multiple_choice),
      "group": "Nome do grupo a que esta pergunta pertence (opcional)"
    },
    ...mais perguntas
  ],
  "groups": [
    {
      "name": "Nome do grupo 1",
      "description": "Descrição do grupo (opcional)"
    },
    ...mais grupos
  ]
}

IMPORTANTE:
1. Para perguntas do tipo "multiple_choice", sempre inclua um array de opções.
2. Agrupe as perguntas em categorias lógicas para facilitar a organização.
3. Crie exatamente ${questionCount} perguntas.
4. Não inclua nada além do JSON válido na sua resposta.
`;

    console.log("System message:", systemMessage);
    console.log("User prompt:", prompt);

    let response;
    
    // Use specific assistant if provided
    if (assistantId) {
      // This is a placeholder for using a specific OpenAI Assistant
      // We'd need to implement the actual Assistants API calls here
      console.log("Using custom assistant:", assistantId);
      
      // For now, fall back to chat completion
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });
    } else {
      // Standard chat completion
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let generatedContent;

    try {
      // Extract the content from the AI response
      const content = data.choices[0].message.content;
      console.log("Raw AI response:", content);
      
      // Parse the JSON response
      generatedContent = JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw response content:", data.choices[0].message.content);
      
      // Return a structured error with empty arrays for questions/groups to prevent client errors
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to parse AI response as JSON. The AI did not return a valid JSON format.",
        checklistData: {
          title: checklistData.title || "Checklist gerado por IA",
          description: "Houve um erro ao gerar o conteúdo."
        },
        questions: [],
        groups: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 even on parse error to allow client to handle it
      });
    }

    // Process the generated content
    const title = generatedContent.title || checklistData.title || "Checklist gerado por IA";
    const description = generatedContent.description || `Checklist gerado com base no prompt: ${prompt}`;
    
    // Ensure questions is always an array, even if the AI fails to provide it
    const questions = generatedContent.questions || [];
    
    // Process groups
    const groupsFromResponse = generatedContent.groups || [];
    const groupMap = new Map();
    
    // Create unique IDs for groups and build a lookup map
    const groups = groupsFromResponse.map((group: any, index: number) => {
      const groupId = `group-${index + 1}`;
      groupMap.set(group.name, groupId);
      
      return {
        id: groupId,
        title: group.name,
        description: group.description || "",
        order: index
      };
    });
    
    // Transform questions to our format, ensuring required fields and correct types
    const processedQuestions = questions.map((q: any, index: number) => {
      // Find or create a group ID for this question
      let groupId = undefined;
      
      if (q.group && groupMap.has(q.group)) {
        groupId = groupMap.get(q.group);
      }
      
      // Initialize an empty options array if it's a multiple choice question
      let options: string[] = [];
      if (q.type === 'multiple_choice') {
        // Ensure options is an array
        if (Array.isArray(q.options) && q.options.length > 0) {
          options = q.options;
        } else {
          // Fallback options if none were provided
          options = ["Opção 1", "Opção 2", "Opção 3"];
        }
      }
      
      return {
        id: `ai-${Date.now()}-${index}`,
        text: q.text,
        responseType: q.type || 'yes_no',
        isRequired: q.required !== undefined ? q.required : true,
        options: options,
        groupId: groupId,
        weight: 1,
        allowsPhoto: false,
        allowsVideo: false,
        allowsAudio: false,
        order: index
      };
    });
    
    // Return the structured response
    return new Response(JSON.stringify({
      success: true,
      checklistData: {
        ...checklistData,
        title,
        description,
      },
      questions: processedQuestions,
      groups
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error generating checklist:", error);
    
    // Return a structured error with empty arrays
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
      checklistData: {
        title: "Erro na geração",
        description: "Houve um erro ao gerar o conteúdo."
      },
      questions: [],
      groups: []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
