
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    const { prompt, parentQuestionId, parentQuestionText, questionCount = 5 } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    if (!parentQuestionId) {
      throw new Error('Parent question ID is required');
    }

    const systemMessage = `
You are an expert at creating detailed sub-checklists for inspection questions. 
For the following parent question, create a detailed sub-checklist with ${questionCount} specific questions that would help fully assess this aspect.

Create a very specific, detailed sub-checklist with technical and relevant questions. Your response should follow this exact JSON format:

{
  "title": "A short, descriptive title for this sub-checklist (derived from the parent question)",
  "description": "A brief explanation of what this sub-checklist evaluates",
  "questions": [
    {
      "text": "Question text",
      "responseType": "yes_no" | "text" | "numeric" | "multiple_choice",
      "isRequired": true | false,
      "options": ["Option 1", "Option 2"] (only for multiple_choice type)
    }
  ]
}

Make sure all questions are directly related to the parent question and help evaluate it in detail.
`;

    console.log("Generating sub-checklist for parent question:", parentQuestionText);
    console.log("With prompt:", prompt);

    // Call OpenAI API to generate sub-checklist
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let subChecklist;

    try {
      const content = data.choices[0].message.content;
      console.log("Raw AI response:", content);
      
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/) || [null, content];
      const jsonContent = jsonMatch[1] || content;
      
      subChecklist = JSON.parse(jsonContent);
      
      // Validate the structure
      if (!subChecklist.title || !Array.isArray(subChecklist.questions)) {
        throw new Error("Invalid sub-checklist structure");
      }
      
      // Process the questions
      subChecklist.questions = subChecklist.questions.map((q: any) => {
        // Ensure responseType is valid
        if (!["yes_no", "text", "numeric", "multiple_choice"].includes(q.responseType)) {
          q.responseType = "yes_no";
        }
        
        // Ensure multiple_choice questions have options
        if (q.responseType === "multiple_choice" && (!q.options || !Array.isArray(q.options) || q.options.length < 2)) {
          q.options = ["Option 1", "Option 2", "Option 3"];
        }
        
        return {
          text: q.text,
          responseType: q.responseType,
          isRequired: q.isRequired !== false,
          options: q.options,
          allowsPhoto: false,
          allowsVideo: false,
          allowsAudio: false
        };
      });
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to parse AI response as JSON."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    return new Response(JSON.stringify({
      success: true,
      subChecklist: {
        title: subChecklist.title,
        description: subChecklist.description || `Sub-checklist for: ${parentQuestionText}`,
        parentQuestionId,
        questions: subChecklist.questions
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error generating sub-checklist:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
