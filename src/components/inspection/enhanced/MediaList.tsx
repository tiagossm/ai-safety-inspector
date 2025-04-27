
import React from "react";
import { MediaPreview } from "./MediaPreview";
import { AIAnalysisButton } from "./AIAnalysisButton";

interface MediaListProps {
  mediaUrls: string[];
  questionId: string;
  questionText: string;
  onPreview: (url: string) => void;
  onRemove: (url: string) => void;
  onAIAnalysis?: (comment: string, actionPlan?: string) => void;
}

export function MediaList({
  mediaUrls,
  questionId,
  questionText,
  onPreview,
  onRemove,
  onAIAnalysis
}: MediaListProps) {
  if (mediaUrls.length === 0) return null;
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mt-2">
        {mediaUrls.map((url, index) => (
          <MediaPreview 
            key={`${url}-${index}`}
            url={url}
            onPreview={onPreview}
            onRemove={onRemove}
          />
        ))}
      </div>
      
      {onAIAnalysis && (
        <AIAnalysisButton 
          questionId={questionId}
          mediaUrls={mediaUrls}
          questionText={questionText}
          onAnalysisComplete={onAIAnalysis}
          disabled={mediaUrls.length === 0}
        />
      )}
    </div>
  );
}
