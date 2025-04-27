
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
  
  // Maximum number of media items to show before showing a count
  const MAX_DISPLAY = 5;
  const hasMoreItems = mediaUrls.length > MAX_DISPLAY;
  const displayUrls = hasMoreItems ? mediaUrls.slice(0, MAX_DISPLAY) : mediaUrls;
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mt-2">
        {displayUrls.map((url, index) => (
          <MediaPreview 
            key={`${url}-${index}`}
            url={url}
            onPreview={onPreview}
            onRemove={onRemove}
          />
        ))}
        {hasMoreItems && (
          <div 
            className="h-16 w-16 bg-muted rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/80"
            onClick={() => onPreview(mediaUrls[MAX_DISPLAY])}
          >
            <span className="text-sm font-medium">+{mediaUrls.length - MAX_DISPLAY}</span>
          </div>
        )}
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
