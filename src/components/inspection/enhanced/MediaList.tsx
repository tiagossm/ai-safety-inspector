
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
  previewSize?: "sm" | "md" | "lg";
  showAIButton?: boolean;
}

export function MediaList({
  mediaUrls,
  questionId,
  questionText,
  onPreview,
  onRemove,
  onAIAnalysis,
  previewSize = "md",
  showAIButton = true
}: MediaListProps) {
  if (!mediaUrls || mediaUrls.length === 0) return null;
  
  // Maximum number of media items to show before showing a count
  const MAX_DISPLAY = 5;
  const hasMoreItems = mediaUrls.length > MAX_DISPLAY;
  const displayUrls = hasMoreItems ? mediaUrls.slice(0, MAX_DISPLAY) : mediaUrls;
  
  const handleAIAnalysis = (comment: string, actionPlan?: string) => {
    if (onAIAnalysis) {
      onAIAnalysis(comment, actionPlan);
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {displayUrls.map((url, index) => (
          <MediaPreview 
            key={`${url}-${index}`}
            url={url}
            onPreview={() => onPreview(url)}
            onRemove={() => onRemove(url)}
            size={previewSize}
          />
        ))}
        {hasMoreItems && (
          <div 
            className={`bg-muted rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/80 ${
              previewSize === "sm" ? "h-12 w-12" : 
              previewSize === "lg" ? "h-24 w-24" : 
              "h-16 w-16"
            }`}
            onClick={() => onPreview(mediaUrls[MAX_DISPLAY])}
          >
            <span className="text-sm font-medium">+{mediaUrls.length - MAX_DISPLAY}</span>
          </div>
        )}
      </div>
      
      {showAIButton && onAIAnalysis && mediaUrls.length > 0 && (
        <AIAnalysisButton 
          questionId={questionId}
          mediaUrls={mediaUrls}
          questionText={questionText}
          onAnalysisComplete={handleAIAnalysis}
          disabled={mediaUrls.length === 0}
        />
      )}
    </div>
  );
}
