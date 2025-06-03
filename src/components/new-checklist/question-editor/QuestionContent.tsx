
import React from "react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { ResponseTypeSection } from "./ResponseTypeSection";
import { OptionsSection } from "./OptionsSection";
import { HintSection } from "./HintSection";
import { MediaSection } from "./MediaSection";
import { RequiredSection } from "./RequiredSection";

interface QuestionContentProps {
  question: ChecklistQuestion;
  onUpdate: (question: ChecklistQuestion) => void;
  enableAllMedia?: boolean;
}

export function QuestionContent({ question, onUpdate, enableAllMedia }: QuestionContentProps) {
  return (
    <div className="p-4 space-y-4">
      <ResponseTypeSection 
        question={question} 
        onUpdate={onUpdate} 
      />
      
      <OptionsSection 
        question={question} 
        onUpdate={onUpdate} 
      />
      
      <HintSection 
        question={question} 
        onUpdate={onUpdate} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MediaSection 
          question={question} 
          onUpdate={onUpdate}
          enableAllMedia={enableAllMedia}
        />
        
        <RequiredSection 
          question={question} 
          onUpdate={onUpdate} 
        />
      </div>
    </div>
  );
}
