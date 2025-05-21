import React, { useCallback } from 'react';
import { YesNoResponseInput } from './response-types/YesNoResponseInput';
import { TextResponseInput } from './response-types/TextResponseInput';
import { NumberResponseInput } from './response-types/NumberResponseInput';
import { MultipleChoiceInput } from "@/components/inspection/question-inputs/MultipleChoiceInput";

interface ResponseInputProps {
  question: any;
  value?: any;
  onChange: (value: any) => void;
  inspectionId?: string;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
}

export function ResponseInput({ 
  question, 
  value, 
  onChange,
  inspectionId,
  actionPlan,
  onSaveActionPlan
}: ResponseInputProps) {
  const responseType = question.responseType || 'yes_no';

  // Se não vier objeto, constrói o padrão
  const responseObject = typeof value === 'object'
    ? value
    : { value: value, mediaUrls: [] };

  const handleValueChange = useCallback((newValue: any) => {
    if (typeof newValue === 'object' && newValue !== null) {
      onChange(newValue);
    } else {
      onChange({
        ...responseObject,
        value: newValue
      });
    }
  }, [onChange, responseObject]);

  const handleSimpleValueChange = useCallback((value: any) => {
    onChange({
      ...responseObject,
      value
    });
  }, [onChange, responseObject]);

  const mediaUrls = responseObject.mediaUrls || [];

  const handleMediaChange = useCallback((urls: string[]) => {
    onChange({
      ...responseObject,
      mediaUrls: urls
    });
  }, [onChange, responseObject]);

  switch (responseType) {
    case "yes_no":
      return (
        <YesNoResponseInput
          question={question}
          response={responseObject}
          onResponseChange={handleValueChange}
          inspectionId={inspectionId}
          actionPlan={actionPlan}
          onSaveActionPlan={onSaveActionPlan}
        />
      );
    case "text":
      return (
        <TextResponseInput
          question={question}
          response={responseObject}
          onResponseChange={handleValueChange}
          inspectionId={inspectionId}
          actionPlan={actionPlan}
          onSaveActionPlan={onSaveActionPlan}
        />
      );
    case "number":
      return (
        <div className="space-y-2">
          <NumberResponseInput
            question={question}
            response={responseObject}
            onResponseChange={handleValueChange}
            onChange={handleSimpleValueChange}
            inspectionId={inspectionId}
            actionPlan={actionPlan}
            onSaveActionPlan={onSaveActionPlan}
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão numérica")}
              onDeleteMedia={(url) => {
                const updatedUrls = mediaUrls.filter((mediaUrl) => mediaUrl !== url);
                handleMediaChange(updatedUrls);
              }}
              allowsPhoto={question.allowsPhoto}
              allowsVideo={question.allowsVideo}
              allowsAudio={question.allowsAudio}
              allowsFiles={question.allowsFiles}
            />
          )}
        </div>
      );
    case "multiple_choice":
      return (
        <div className="space-y-2">
          <MultipleChoiceInput 
            options={question.options || []}
            value={responseObject.value}
            onChange={handleSimpleValueChange}
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão múltipla escolha")}
              onDeleteMedia={(url) => {
                const updatedUrls = mediaUrls.filter((mediaUrl) => mediaUrl !== url);
                handleMediaChange(updatedUrls);
              }}
              allowsPhoto={question.allowsPhoto}
              allowsVideo={question.allowsVideo}
              allowsAudio={question.allowsAudio}
              allowsFiles={question.allowsFiles}
            />
          )}
        </div>
      );
    case "photo":
      return (
        <PhotoInput
          mediaUrls={mediaUrls}
          onAddMedia={() => console.log("Adicionar mídia para questão foto")}
          onDeleteMedia={(url) => {
            const updatedUrls = mediaUrls.filter((mediaUrl) => mediaUrl !== url);
            handleMediaChange(updatedUrls);
          }}
          allowsPhoto={true}
          allowsVideo={question.allowsVideo}
          allowsAudio={question.allowsAudio}
          allowsFiles={question.allowsFiles}
        />
      );
    case "signature":
      return (
        <div className="space-y-2">
          <SignatureInput 
            value={responseObject.value || ""}
            onChange={handleSimpleValueChange}
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão assinatura")}
              onDeleteMedia={(url) => {
                const updatedUrls = mediaUrls.filter((mediaUrl) => mediaUrl !== url);
                handleMediaChange(updatedUrls);
              }}
              allowsPhoto={question.allowsPhoto}
              allowsVideo={question.allowsVideo}
              allowsAudio={question.allowsAudio}
              allowsFiles={question.allowsFiles}
            />
          )}
        </div>
      );
    case "time":
      return (
        <TimeResponseInput
          response={responseObject}
          value={responseObject.value}
          onChange={(value) => handleValueChange({...responseObject, value})}
          onMediaChange={handleMediaChange}
          allowsMedia={!!mediaUrls.length || question.allowsPhoto}
          onMediaUpload={() => console.log("Media upload for time question")}
        />
      );
    case "date":
      return (
        <DateResponseInput
          response={responseObject}
          value={responseObject.value}
          onChange={(value) => handleValueChange({...responseObject, value})}
          onMediaChange={handleMediaChange}
          allowsMedia={!!mediaUrls.length || question.allowsPhoto}
          onMediaUpload={() => console.log("Media upload for date question")}
        />
      );
    case "multiple_choice":
      return (
        <MultipleChoiceInput
          options={question.options || []}
          value={responseObject.value}
          onChange={(option) => handleValueChange({
            ...responseObject,
            value: option
          })}
        />
      );
    case "date":
      return (
        <input
          type="date"
          value={responseObject.value}
          onChange={e => handleValueChange({
            ...responseObject,
            value: e.target.value
          })}
        />
      );
    case "time":
      return (
        <TimeResponseInput
          value={responseObject.value}
          onChange={(timeValue) => handleValueChange({
            ...responseObject,
            value: timeValue
          })}
        />
      );
    default:
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-700">
            Tipo de resposta não suportado: {responseType}
          </p>>
        </div>
      );
  }
}