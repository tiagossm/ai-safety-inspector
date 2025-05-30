
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

// Define CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAiConfig = new Configuration({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

const openai = new OpenAIApi(openAiConfig);

async function generateWithAssistant(prompt: string, questionCount: number, assistantId: string | undefined) {
  try {
    // Log the assistant ID being used
    console.log(`Attempting to generate checklist with assistant: ${assistantId || "default"}`);
    
    // Validate the assistant ID if provided
    if (assistantId) {
      try {
        // Try to retrieve the assistant to verify it exists
        const response = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Assistant not found: ${assistantId}`);
        }
        
        const assistantData = await response.json();
        console.log(`Using assistant: ${assistantData.name} (${assistantId})`);
      } catch (error) {
        console.error(`Error validating assistant: ${error.message}`);
        throw error;
      }
    }
    
    // Create thread
    const threadResponse = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`
      },
      body: JSON.stringify({})
    });
    
    if (!threadResponse.ok) {
      throw new Error("Failed to create thread");
    }
    
    const threadData = await threadResponse.json();
    const threadId = threadData.id;
    console.log(`Thread created: ${threadId}`);
    
    // Add message to thread
    const messageText = `Generate a checklist with the following requirements:\n\n${prompt}\n\nPlease generate exactly ${questionCount} questions.`;
    
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`
      },
      body: JSON.stringify({
        role: "user",
        content: messageText
      })
    });
    
    if (!messageResponse.ok) {
      throw new Error("Failed to add message to thread");
    }
    
    console.log(`Message added to thread ${threadId}`);
    
    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        instructions: `Generate a checklist with ${questionCount} questions based on the user's prompt. 
The response must be in JSON format with the following structure:
{
  "title": "Title of the checklist",
  "description": "Description of the checklist",
  "groups": [
    {
      "id": "group-1",
      "title": "Group title",
      "order": 0
    }
  ],
  "questions": [
    {
      "id": "q1",
      "text": "Question text",
      "responseType": "yes_no", // One of: yes_no, multiple_choice, text, numeric, photo, signature
      "isRequired": true,
      "weight": 1,
      "groupId": "group-1",
      "order": 0,
      "options": ["Option 1", "Option 2"] // Only for multiple_choice
    }
  ]
}`
      })
    });
    
    if (!runResponse.ok) {
      throw new Error("Failed to run assistant");
    }
    
    const runData = await runResponse.json();
    const runId = runData.id;
    console.log(`Run created: ${runId}`);
    
    // Poll for completion
    let runStatus = "queued";
    let attempts = 0;
    const maxAttempts = 30;
    const pollInterval = 1000;
    
    while ((runStatus === "queued" || runStatus === "in_progress") && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const checkRunResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`
        }
      });
      
      if (!checkRunResponse.ok) {
        throw new Error("Failed to check run status");
      }
      
      const checkRunData = await checkRunResponse.json();
      runStatus = checkRunData.status;
      attempts++;
      console.log(`Run status: ${runStatus} (attempt ${attempts}/${maxAttempts})`);
    }
    
    if (runStatus !== "completed") {
      throw new Error(`Run did not complete in time. Status: ${runStatus}`);
    }
    
    // Get messages
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`
      }
    });
    
    if (!messagesResponse.ok) {
      throw new Error("Failed to get messages");
    }
    
    const messagesData = await messagesResponse.json();
    
    // Find the assistant's response
    const assistantMessages = messagesData.data.filter((msg: any) => msg.role === "assistant");
    
    if (!assistantMessages.length) {
      throw new Error("No assistant messages found");
    }
    
    // Get the most recent assistant message
    const lastMessage = assistantMessages[0];
    const messageContent = lastMessage.content[0]?.text?.value || "";
    
    console.log("Parsing assistant response to JSON");
    
    // Try to extract JSON from the response
    try {
      const jsonMatch = messageContent.match(/```json\n([\s\S]*?)\n```/) || 
                         messageContent.match(/```([\s\S]*?)```/) ||
                         messageContent.match(/{[\s\S]*}/);
      
      if (!jsonMatch) {
        throw new Error("No JSON found in assistant response");
      }
      
      const jsonString = jsonMatch[1] || jsonMatch[0];
      const jsonData = JSON.parse(jsonString.replace(/```json|```/g, '').trim());
      
      // Ensure questions have unique IDs
      if (jsonData.questions) {
        jsonData.questions = jsonData.questions.map((q: any, index: number) => ({
          ...q,
          id: `ai-${Date.now()}-${index}`,
          order: index
        }));
      }
      
      // Ensure groups have unique IDs
      if (jsonData.groups) {
        jsonData.groups = jsonData.groups.map((g: any, index: number) => ({
          ...g,
          id: `group-${Date.now()}-${index}`,
          order: index
        }));
      }
      
      console.log(`Successfully generated checklist with ${jsonData.questions?.length || 0} questions`);
      
      return {
        checklistData: {
          title: jsonData.title,
          description: jsonData.description
        },
        questions: jsonData.questions || [],
        groups: jsonData.groups || []
      };
    } catch (error) {
      console.error("Error parsing JSON from assistant response:", error);
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in generateWithAssistant:", error);
    throw error;
  }
}

// Traditional OpenAI API approach as fallback
async function generateWithOpenAI(prompt: string, questionCount: number): Promise<any> {
  try {
    console.log("Using OpenAI API directly as fallback");
    
    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: `You are a checklist generation assistant. Create detailed, professional checklists for various purposes.
Generate a checklist with ${questionCount} questions. The response must be in JSON format with the following structure:
{
  "title": "Title of the checklist",
  "description": "Description of the checklist",
  "groups": [
    {
      "id": "group-1",
      "title": "Group title",
      "order": 0
    }
  ],
  "questions": [
    {
      "id": "q1",
      "text": "Question text",
      "responseType": "yes_no", // One of: yes_no, multiple_choice, text, numeric, photo, signature
      "isRequired": true,
      "weight": 1,
      "groupId": "group-1",
      "order": 0,
      "options": ["Option 1", "Option 2"] // Only for multiple_choice
    }
  ]
}`
        },
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: `Generate a checklist with the following requirements:\n\n${prompt}\n\nPlease generate exactly ${questionCount} questions.`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });
    
    // Extract the JSON from the response text
    const responseText = response.data.choices[0]?.message?.content || "";
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                     responseText.match(/```([\s\S]*?)```/) ||
                     responseText.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      throw new Error("No JSON found in OpenAI response");
    }
    
    const jsonString = jsonMatch[1] || jsonMatch[0];
    const jsonData = JSON.parse(jsonString.replace(/```json|```/g, '').trim());
    
    // Ensure questions have unique IDs
    if (jsonData.questions) {
      jsonData.questions = jsonData.questions.map((q: any, index: number) => ({
        ...q,
        id: `ai-${Date.now()}-${index}`,
        order: index
      }));
    }
    
    // Ensure groups have unique IDs
    if (jsonData.groups) {
      jsonData.groups = jsonData.groups.map((g: any, index: number) => ({
        ...g,
        id: `group-${Date.now()}-${index}`,
        order: index
      }));
    }
    
    return {
      checklistData: {
        title: jsonData.title,
        description: jsonData.description
      },
      questions: jsonData.questions || [],
      groups: jsonData.groups || []
    };
  } catch (error) {
    console.error("Error in generateWithOpenAI:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { prompt, questionCount = 10, checklistData, assistantId } = await req.json();
    console.log(`Generating checklist with prompt: "${prompt.substring(0, 50)}..."`);
    console.log(`Question count: ${questionCount}`);
    console.log(`Assistant ID: ${assistantId || "not provided"}`);
    
    let result;
    
    try {
      if (assistantId) {
        result = await generateWithAssistant(prompt, questionCount, assistantId);
      } else {
        throw new Error("No assistant ID provided, falling back to OpenAI API");
      }
    } catch (error) {
      console.log(`Error with assistant method: ${error.message}, falling back to OpenAI API`);
      result = await generateWithOpenAI(prompt, questionCount);
    }
    
    return new Response(JSON.stringify({
      success: true,
      checklistData: {
        ...checklistData,
        title: result.checklistData.title || checklistData.title,
        description: result.checklistData.description || checklistData.description
      },
      questions: result.questions || [],
      groups: result.groups || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in generate-checklist function:", error);
    return new Response(JSON.stringify({
      success: false,
      error: `${error.message || "Unknown error occurred"}`
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
