
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MediaUploadInput } from "../question-inputs/MediaUploadInput";

interface ResponseInputRendererProps {
  question: any;
  response: any;
  onResponseChange: (value: any) => void;
  onMediaChange?: (mediaUrls: string[]) => void;
}

export const ResponseInputRenderer: React.FC<ResponseInputRendererProps> = ({
  question,
  response,
  onResponseChange,
  onMediaChange
}) => {
  // Determine response type
  const responseType = question.responseType || question.tipo_resposta || "text";
  
  const handleMediaChange = (urls: string[]) => {
    if (onMediaChange) {
      onMediaChange(urls);
    }
  };
  
  // Handle yes/no responses
  if (responseType === 'yes_no') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            className={`px-3 py-1 rounded text-sm ${
              response?.value === 'sim' 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => onResponseChange('sim')}
            size="sm"
            variant={response?.value === 'sim' ? 'default' : 'outline'}
          >
            Sim
          </Button>
          <Button
            className={`px-3 py-1 rounded text-sm ${
              response?.value === 'não' 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => onResponseChange('não')}
            size="sm"
            variant={response?.value === 'não' ? 'default' : 'outline'}
          >
            Não
          </Button>
          <Button
            className={`px-3 py-1 rounded text-sm ${
              response?.value === 'n/a' 
                ? 'bg-gray-500 text-white hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => onResponseChange('n/a')}
            size="sm"
            variant={response?.value === 'n/a' ? 'default' : 'outline'}
          >
            N/A
          </Button>
        </div>
        
        {/* Media upload section if allowed */}
        {(question.allowsPhoto || question.permite_foto || 
          question.allowsVideo || question.permite_video ||
          question.allowsAudio || question.permite_audio ||
          question.allowsFiles || question.permite_files) && (
          <MediaUploadInput 
            mediaUrls={response?.mediaUrls || []}
            onMediaChange={handleMediaChange}
            allowsPhoto={question.allowsPhoto || question.permite_foto}
            allowsVideo={question.allowsVideo || question.permite_video}
            allowsAudio={question.allowsAudio || question.permite_audio}
            allowsFiles={question.allowsFiles || question.permite_files}
          />
        )}
      </div>
    );
  }
  
  // Default to text input for all other types
  return (
    <div className="space-y-4">
      <textarea
        className="w-full border rounded p-2 text-sm"
        rows={3}
        placeholder="Digite sua resposta..."
        value={response?.value || ''}
        onChange={(e) => onResponseChange(e.target.value)}
      />
      
      {/* Media upload section if allowed */}
      {(question.allowsPhoto || question.permite_foto || 
        question.allowsVideo || question.permite_video ||
        question.allowsAudio || question.permite_audio ||
        question.allowsFiles || question.permite_files) && (
        <MediaUploadInput 
          mediaUrls={response?.mediaUrls || []}
          onMediaChange={handleMediaChange}
          allowsPhoto={question.allowsPhoto || question.permite_foto}
          allowsVideo={question.allowsVideo || question.permite_video}
          allowsAudio={question.allowsAudio || question.permite_audio}
          allowsFiles={question.allowsFiles || question.permite_files}
        />
      )}
    </div>
  );
};
