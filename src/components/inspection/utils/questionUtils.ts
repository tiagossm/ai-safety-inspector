
export const getAllowedAttachmentTypes = (question: any): ("photo" | "video" | "audio" | "file")[] => {
  const types: ("photo" | "video" | "audio" | "file")[] = ["file"];
  
  if (question.allowsPhoto) {
    types.push("photo");
  }
  
  if (question.allowsVideo) {
    types.push("video");
  }
  
  if (question.allowsAudio) {
    types.push("audio");
  }
  
  return types;
};

export const shouldShowQuestion = (question: any, allQuestions: any[], responses: Record<string, any>) => {
  const isFollowUpQuestion = !!question.parentQuestionId;
  
  if (!isFollowUpQuestion) return true;
  
  const parentQuestion = isFollowUpQuestion ? 
    allQuestions.find(q => q.id === question.parentQuestionId) : null;
  
  return parentQuestion && 
         responses[parentQuestion.id] && 
         responses[parentQuestion.id].value === question.conditionValue;
};

export const getQuestionCardClasses = (question: any, response: any) => {
  let baseClasses = "overflow-hidden border border-gray-200 shadow-sm";
  
  if (!response?.value && question.isRequired) {
    return `${baseClasses} border-l-4 border-l-yellow-400`;
  }
  
  if (question.responseType === "sim/não" || question.responseType === "yes_no") {
    if (response?.value === "sim") return `${baseClasses} border-l-4 border-l-green-400`;
    if (response?.value === "não") return `${baseClasses} border-l-4 border-l-red-400`;
    return baseClasses;
  }
  
  if (response?.value) {
    return `${baseClasses} border-l-4 border-l-blue-400`;
  }
  
  return baseClasses;
};
