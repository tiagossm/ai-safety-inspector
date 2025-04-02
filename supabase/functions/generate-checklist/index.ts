import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_ASSISTANT_API_URL = "https://api.openai.com/v1/assistants";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if API key is available
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "OpenAI API key is required. Please set the OPENAI_API_KEY environment variable."
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { prompt, checklistData, questionCount, assistantId } = await req.json();

    // Validate input
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let generatedContent;

    // Use a specific assistant if provided
    if (assistantId) {
      generatedContent = await generateWithAssistant(assistantId, prompt, questionCount || 10);
    } else {
      // Otherwise use the standard model
      generatedContent = await generateWithModel(prompt, questionCount || 10);
    }

    if (!generatedContent) {
      throw new Error("Failed to generate content");
    }

    // Parse and process the generated content
    const processedData = processGeneratedContent(generatedContent, checklistData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        checklistData: {
          ...checklistData,
          title: processedData.title || checklistData.title,
          description: processedData.description || checklistData.description
        },
        questions: processedData.questions,
        groups: processedData.groups || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in generate-checklist function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An error occurred',
        checklistData: {},
        questions: [],
        groups: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Function to generate content with a specific OpenAI assistant
async function generateWithAssistant(assistantId, prompt, questionCount) {
  try {
    // First check if the assistant exists
    const assistantResponse = await fetch(`${OPENAI_ASSISTANT_API_URL}/${assistantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    if (!assistantResponse.ok) {
      throw new Error(`Assistant not found: ${assistantId}`);
    }

    // Create a thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({})
    });

    if (!threadResponse.ok) {
      throw new Error('Failed to create thread');
    }

    const threadData = await threadResponse.json();
    const threadId = threadData.id;

    // Add a message to the thread
    const enhancedPrompt = `${prompt}\n\nCrie um checklist com aproximadamente ${questionCount} perguntas. O resultado deve ser formatado como JSON com: title, description, questions (array com objetos que possuem text, responseType, isRequired, options). Tipos possíveis: yes_no, multiple_choice, text, numeric, photo, signature.`;
    
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        role: 'user',
        content: enhancedPrompt
      })
    });

    if (!messageResponse.ok) {
      throw new Error('Failed to add message to thread');
    }

    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    if (!runResponse.ok) {
      throw new Error('Failed to run assistant');
    }

    const runData = await runResponse.json();
    const runId = runData.id;

    // Poll for the run to complete
    let runStatus = 'queued';
    let maxPolls = 60; // Maximum number of polls (2 minutes at 2-second intervals)
    let pollCount = 0;

    while (['queued', 'in_progress'].includes(runStatus) && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls
      pollCount++;

      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v1'
        }
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to check run status');
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;

      if (runStatus === 'completed') {
        break;
      } else if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
        throw new Error(`Run failed with status: ${runStatus}`);
      }
    }

    if (pollCount >= maxPolls) {
      throw new Error('Timed out waiting for assistant response');
    }

    // Get the assistant's messages
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    if (!messagesResponse.ok) {
      throw new Error('Failed to retrieve messages');
    }

    const messagesData = await messagesResponse.json();
    
    // Find the assistant's response (should be the most recent message by the assistant)
    const assistantMessages = messagesData.data.filter(msg => msg.role === 'assistant');
    
    if (assistantMessages.length === 0) {
      throw new Error('No response from assistant');
    }

    const assistantResponse = assistantMessages[0].content[0].text.value;
    return assistantResponse;

  } catch (error) {
    console.error('Error in generateWithAssistant:', error);
    throw error;
  }
}

// Function to generate content with a standard OpenAI model
async function generateWithModel(prompt, questionCount) {
  const enhancedPrompt = `${prompt}\n\nCrie um checklist com aproximadamente ${questionCount} perguntas. O resultado deve ser formatado como JSON com os seguintes campos:
  
  {
    "title": "Título do Checklist",
    "description": "Descrição detalhada do checklist",
    "questions": [
      {
        "text": "Texto da pergunta 1",
        "responseType": "yes_no", // Tipos: yes_no, multiple_choice, text, numeric, photo, signature
        "isRequired": true,
        "allowsPhoto": false,
        "allowsVideo": false,
        "allowsAudio": false,
        "options": ["Opção 1", "Opção 2"] // Obrigatório apenas para multiple_choice
      },
      // Mais perguntas...
    ]
  }
  
  Responda apenas com o JSON, sem texto adicional.`;

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Use a newer model for better results
      messages: [
        { 
          role: 'system', 
          content: 'Você é um assistente especializado em criar checklists detalhados para inspeções de segurança, manutenção e qualidade. Você sempre retorna o resultado em formato JSON válido, conforme solicitado.' 
        },
        { role: 'user', content: enhancedPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Process and sanitize the generated content
function processGeneratedContent(content, checklistData) {
  try {
    // Extract JSON from the response (handling possible text around it)
    let jsonString = content.trim();
    
    // If response contains markdown code blocks, extract JSON
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1].trim();
    }

    // Try to parse the JSON
    const parsedData = JSON.parse(jsonString);
    
    // Ensure the required structure exists
    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      throw new Error('Invalid JSON structure: missing or invalid questions array');
    }

    // Process and validate each question
    const processedQuestions = parsedData.questions.map((question, index) => ({
      id: `ai-generated-${Date.now()}-${index}`,
      text: question.text || `Pergunta ${index + 1}`,
      responseType: validateResponseType(question.responseType || 'yes_no'),
      isRequired: question.isRequired !== false,
      weight: question.weight || 1,
      allowsPhoto: question.allowsPhoto || false,
      allowsVideo: question.allowsVideo || false,
      allowsAudio: question.allowsAudio || false,
      options: question.responseType === 'multiple_choice' ? (question.options || ['Opção 1', 'Opção 2']) : undefined,
      order: index
    }));

    // Generate a default group to organize questions
    const defaultGroup = {
      id: `group-default-${Date.now()}`,
      title: parsedData.title || checklistData.title || 'Checklist Gerado por IA',
      order: 0
    };

    return {
      title: parsedData.title || checklistData.title || 'Checklist Gerado por IA',
      description: parsedData.description || checklistData.description || `Checklist gerado com base no prompt: ${checklistData.prompt || 'IA'}`,
      questions: processedQuestions,
      groups: [defaultGroup]
    };
  } catch (error) {
    console.error('Error processing generated content:', error);
    console.error('Content that failed to process:', content);
    
    // Return a minimal valid structure on error
    return {
      title: checklistData.title || 'Checklist Gerado por IA (Erro)',
      description: `Houve um erro ao processar o conteúdo gerado. ${error.message}`,
      questions: [
        {
          id: `error-${Date.now()}-0`,
          text: 'Houve um erro ao gerar as perguntas. Por favor, tente novamente.',
          responseType: 'yes_no',
          isRequired: true,
          weight: 1,
          allowsPhoto: false,
          allowsVideo: false,
          allowsAudio: false,
          order: 0
        }
      ],
      groups: [
        {
          id: `group-error-${Date.now()}`,
          title: 'Erro na Geração',
          order: 0
        }
      ]
    };
  }
}

function validateResponseType(type) {
  const validTypes = ['yes_no', 'multiple_choice', 'text', 'numeric', 'photo', 'signature'];
  return validTypes.includes(type) ? type : 'yes_no';
}
