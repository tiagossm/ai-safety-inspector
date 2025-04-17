
import React, { memo, useEffect } from "react";
import { YesNoInput } from "../question-inputs/YesNoInput";
import { TextInput } from "../question-inputs/TextInput";
import { NumberInput } from "../question-inputs/NumberInput";
import { MultipleChoiceInput } from "../question-inputs/MultipleChoiceInput";
import { PhotoInput } from "../question-inputs/PhotoInput";

interface ResponseInputRendererProps {
  question: any;
  response: any;
  onResponseChange: (value: any) => void;
  onAddMedia: () => void;
}

export const ResponseInputRenderer = memo(function ResponseInputRenderer({
  question,
  response,
  onResponseChange,
  onAddMedia
}: ResponseInputRendererProps) {
  // Enhanced normalization function to handle different property naming schemes
  const getProperty = (propCamelCase: string, propSnakeCase: string): boolean => {
    const value = question[propCamelCase] === true || question[propSnakeCase] === true;
    return value;
  };
  
  // Get media capabilities with better normalization
  const allowsPhoto = getProperty('allowsPhoto', 'permite_foto');
  const allowsVideo = getProperty('allowsVideo', 'permite_video');
  const allowsAudio = getProperty('allowsAudio', 'permite_audio');
  const allowsFiles = getProperty('allowsFiles', 'permite_files');
  
  // Normalize response type with more robust handling
  const responseType = (() => {
    const type = question.responseType || question.tipo_resposta || "";
    if (typeof type !== 'string') return 'unknown';
    
    const lowerType = type.toLowerCase();
    if (lowerType.includes('sim/não') || lowerType.includes('yes_no') || lowerType.includes('yes/no')) {
      return 'yes_no';
    } else if (lowerType.includes('múltipla') || lowerType.includes('multiple')) {
      return 'multiple_choice';
    } else if (lowerType.includes('texto') || lowerType.includes('text')) {
      return 'text';
    } else if (lowerType.includes('numeric') || lowerType.includes('numérico')) {
      return 'numeric';
    } else if (lowerType.includes('foto') || lowerType.includes('photo')) {
      return 'photo';
    } else {
      return lowerType || "unknown";
    }
  })();
  
  // Enhanced debug logging
  useEffect(() => {
    console.log(`Rendering input for question ${question.id}, type: ${responseType}, media capabilities:`, {
      allowsPhoto, 
      allowsVideo, 
      allowsAudio, 
      allowsFiles,
      rawProps: {
        allowsPhoto: question.allowsPhoto, 
        permite_foto: question.permite_foto,
        allowsFiles: question.allowsFiles,
        permite_files: question.permite_files
      }
    });
  }, [question.id, responseType, allowsPhoto, allowsVideo, allowsAudio, allowsFiles, 
      question.allowsPhoto, question.permite_foto, question.allowsFiles, question.permite_files]);
  
  // For photo type input, we use a specialized component
  if (responseType === 'photo') {
    return (
      <PhotoInput 
        onAddMedia={onAddMedia} 
        mediaUrls={response?.mediaUrls}
        allowsPhoto={allowsPhoto}
        allowsVideo={allowsVideo}
        allowsAudio={allowsAudio}
        allowsFiles={allowsFiles}
      />
    );
  }
  
  // For all other response types, render the appropriate input
  let inputComponent;
  switch (responseType) {
    case "yes_no":
      inputComponent = <YesNoInput value={response?.value} onChange={onResponseChange} />;
      break;
      
    case "numeric":
    case "number":
      inputComponent = <NumberInput value={response?.value} onChange={onResponseChange} />;
      break;
      
    case "text":
      inputComponent = <TextInput value={response?.value} onChange={onResponseChange} />;
      break;
      
    case "multiple_choice":
      const options = question.options || question.opcoes || [];
      inputComponent = <MultipleChoiceInput options={options} value={response?.value} onChange={onResponseChange} />;
      break;
      
    default:
      // Show a more informative fallback when type is unknown
      inputComponent = (
        <div className="mb-2">
          <p className="text-sm text-muted-foreground">Tipo de resposta: {responseType || "unknown"}</p>
        </div>
      );
  }

  return inputComponent;
});
