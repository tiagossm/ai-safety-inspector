
/**
 * Determines the CSS classes for a question card based on its state
 */
export function getQuestionCardClasses(question: any, response: any): string {
  // Base classes for all cards
  let classes = "border";
  
  // If the question has been answered, apply specific styles
  if (response && response.value !== undefined) {
    // Style based on yes/no response type for better visual cues
    if (response.value === "sim") {
      classes += " border-green-300 bg-green-50";
    } else if (response.value === "não") {
      classes += " border-red-300 bg-red-50";
    } else {
      classes += " border-blue-300 bg-blue-50";
    }
  }
  
  // Add specific class for required questions
  if (question.isRequired || question.required) {
    classes += " border-l-4";
  }
  
  return classes;
}

/**
 * Determines if a question should be shown based on parent conditions
 */
export function shouldShowQuestion(
  question: any,
  allQuestions: any[],
  responses: Record<string, any>
): boolean {
  // If it's not a conditional question, always show it
  if (!question.parentQuestionId && !question.parent_item_id) {
    return true;
  }
  
  // Find the parent question
  const parentId = question.parentQuestionId || question.parent_item_id;
  const parentQuestion = allQuestions.find(q => q.id === parentId);
  
  if (!parentQuestion) {
    return true; // If parent not found, default to showing the question
  }
  
  // Get the parent's response
  const parentResponse = responses[parentId];
  
  if (!parentResponse || parentResponse.value === undefined) {
    return false; // If parent has no response, don't show this question
  }
  
  // Check if the condition value matches
  const conditionValue = question.conditionValue || question.condition_value || "sim";
  return parentResponse.value === conditionValue;
}

/**
 * Returns the allowed attachment types for a question
 */
export function getAllowedAttachmentTypes(question: any): string[] {
  const allowedTypes = [];
  
  if (question.allowsPhoto || question.permite_foto) {
    allowedTypes.push("photo");
  }
  
  if (question.allowsVideo || question.permite_video) {
    allowedTypes.push("video");
  }
  
  if (question.allowsAudio || question.permite_audio) {
    allowedTypes.push("audio");
  }
  
  return allowedTypes;
}
