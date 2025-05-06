
import React from "react";
import { MediaUploadInput } from "../../question-inputs/MediaUploadInput";

interface TextResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (value: any) => void;
  onMediaChange: (mediaUrls: string[]) => void;
  readOnly?: boolean;
}

export const TextResponseInput: React.FC<TextResponseInputProps> = ({
  question,
  response,
  onResponseChange,
  onMediaChange,
  readOnly = false
}) => {
  return (
    <div className="space-y-4">
      <textarea
        className="w-full border rounded p-2 text-sm"
        rows={3}
        placeholder="Digite sua resposta..."
        value={response?.value || ''}
        onChange={(e) => !readOnly && onResponseChange(e.target.value)}
        disabled={readOnly}
      />
      
      {/* Media upload section if allowed */}
      {(question.allowsPhoto || question.permite_foto || 
        question.allowsVideo || question.permite_video ||
        question.allowsAudio || question.permite_audio ||
        question.allowsFiles || question.permite_files) && (
        <MediaUploadInput 
          mediaUrls={response?.mediaUrls || []}
          onMediaChange={onMediaChange}
          allowsPhoto={question.allowsPhoto || question.permite_foto}
          allowsVideo={question.allowsVideo || question.permite_video}
          allowsAudio={question.allowsAudio || question.permite_audio}
          allowsFiles={question.allowsFiles || question.permite_files}
          readOnly={readOnly}
        />
      )}
    </div>
  );
};
