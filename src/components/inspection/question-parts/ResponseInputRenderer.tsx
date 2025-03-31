
import React, { memo } from "react";
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
  // Normalization function to handle different property naming schemes
  const getProperty = (propCamelCase: string, propSnakeCase: string) => {
    return question[propCamelCase] !== undefined ? question[propCamelCase] : question[propSnakeCase];
  };
  
  // Get media capabilities
  const allowsPhoto = getProperty('allowsPhoto', 'permite_foto') || false;
  const allowsVideo = getProperty('allowsVideo', 'permite_video') || false;
  const allowsAudio = getProperty('allowsAudio', 'permite_audio') || false;
  
  // Normalize response type
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
      return lowerType;
    }
  })();
  
  // Limitar logs apenas para ambiente de desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Rendering input for question ${question.id}, type: ${responseType}, media: `, {
      allowsPhoto, allowsVideo, allowsAudio
    });
  }
  
  switch (responseType) {
    case "yes_no":
      return <YesNoInput value={response?.value} onChange={onResponseChange} />;
      
    case "numeric":
      return <NumberInput value={response?.value} onChange={onResponseChange} />;
      
    case "text":
      return <TextInput value={response?.value} onChange={onResponseChange} />;
      
    case "multiple_choice":
      const options = question.options || question.opcoes || [];
      return <MultipleChoiceInput options={options} value={response?.value} onChange={onResponseChange} />;
      
    case "photo":
      return (
        <PhotoInput 
          onAddMedia={onAddMedia} 
          mediaUrls={response?.mediaUrls}
          allowsPhoto={allowsPhoto}
          allowsVideo={allowsVideo}
          allowsAudio={allowsAudio}
        />
      );
      
    default:
      // If the question allows media but is another type, still show media buttons
      if (allowsPhoto || allowsVideo || allowsAudio) {
        return (
          <div>
            {responseType !== "photo" && responseType !== "unknown" && (
              <div className="mb-2">
                <p className="text-sm text-muted-foreground">Tipo de resposta: {responseType}</p>
              </div>
            )}
            <PhotoInput 
              onAddMedia={onAddMedia} 
              mediaUrls={response?.mediaUrls}
              allowsPhoto={allowsPhoto}
              allowsVideo={allowsVideo}
              allowsAudio={allowsAudio}
            />
          </div>
        );
      }
      
      return <p className="text-sm text-muted-foreground mt-2">Tipo de resposta não suportado: {responseType}</p>;
  }
});
