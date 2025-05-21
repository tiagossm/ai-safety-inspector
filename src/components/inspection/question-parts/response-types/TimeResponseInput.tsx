
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaAttachments } from "@/components/inspection/question-inputs/MediaAttachments";
import { MediaUploadButton } from "@/components/inspection/question-inputs/MediaUploadButton";
import { ResponseWrapper } from "./components/ResponseWrapper";
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";

interface TimeResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (data: any) => void;
  onMediaChange?: (mediaUrls: string[]) => void;
  onApplyAISuggestion?: (suggestion: string) => void;
  readOnly?: boolean;
}

export function TimeResponseInput({
  question,
  response,
  onResponseChange,
  onMediaChange,
  onApplyAISuggestion,
  readOnly = false
}: TimeResponseInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;

    onResponseChange({
      ...response,
      value: e.target.value,
      updatedAt: new Date().toISOString()
    });
  };

  const handleOpenPreview = (url: string) => {
    console.log("Abrindo preview da mídia:", url);
  };

  const handleOpenAnalysis = (url: string, questionContext?: string) => {
    console.log("Abrindo análise da mídia:", url, "com contexto:", questionContext);
  };

  const handleMediaDelete = (url: string) => {
    if (readOnly) return;

    const updatedMediaUrls = (response.mediaUrls || []).filter(
      (mediaUrl: string) => mediaUrl !== url
    );

    onMediaChange?.(updatedMediaUrls);
  };

  const handleSaveAnalysis = (url: string, result: MediaAnalysisResult) => {
    console.log("Análise salva para:", url, result);
  };

  return (
    <ResponseWrapper>
      <div className="space-y-3">
        <div>
          <Label htmlFor={`time-${question.id}`} className="text-sm font-medium text-gray-700">
            Hora
          </Label>
          <Input
            id={`time-${question.id}`}
            type="time"
            value={response.value || ""}
            onChange={handleInputChange}
            className="w-full mt-1"
            disabled={readOnly}
          />
        </div>

        <div className="flex items-center space-x-2 mt-3">
          {question.allowsPhoto && (
            <MediaUploadButton
              questionId={question.id}
              onMediaUpload={onMediaChange}
              mediaType="image"
              disabled={readOnly}
              currentMediaUrls={response.mediaUrls || []}
              maxFiles={5}
            />
          )}
        </div>

        {response.mediaUrls && response.mediaUrls.length > 0 && (
          <MediaAttachments
            mediaUrls={response.mediaUrls || []}
            onDelete={handleMediaDelete}
            onOpenPreview={handleOpenPreview}
            onOpenAnalysis={handleOpenAnalysis}
            readOnly={readOnly}
            questionText={question.text}
            onSaveAnalysis={handleSaveAnalysis}
            onApplyAISuggestion={onApplyAISuggestion}
          />
        )}
      </div>
    </ResponseWrapper>
  );
}
