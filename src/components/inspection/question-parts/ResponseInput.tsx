
import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { YesNoResponseInput } from './response-types/YesNoResponseInput';
import { TextResponseInput } from './response-types/TextResponseInput';
import { NumberResponseInput } from './response-types/NumberResponseInput';
import { PhotoInput } from '../question-inputs/PhotoInput';
import { MultipleChoiceInput } from '../question-inputs/MultipleChoiceInput';
import { SignatureInput } from '@/components/checklist/SignatureInput';
import { TimeResponseInput } from './response-types/TimeResponseInput';
import { DateResponseInput } from './response-types/DateResponseInput';

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
    case "numeric":
      return (
        <div className="space-y-2">
          <Input
            type="number"
            value={responseObject.value || ""}
            onChange={(e) => handleSimpleValueChange(e.target.value)}
            placeholder="Digite um valor..."
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
    case "paragraph":
      return (
        <div className="space-y-2">
          <Textarea
            value={responseObject.value || ""}
            onChange={(e) => handleSimpleValueChange(e.target.value)}
            placeholder="Digite sua resposta..."
            className="min-h-[120px]"
          />
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão")}
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
    case "dropdown":
      return (
        <div className="space-y-2">
          <select
            value={responseObject.value || ""}
            onChange={(e) => handleSimpleValueChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Selecione uma opção</option>
            {(question.options || []).map((option: string, index: number) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão dropdown")}
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
    case "multiple_select":
      return (
        <div className="space-y-2">
          <div className="space-y-2">
            {(question.options || []).map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(responseObject.value) ? responseObject.value.includes(option) : false}
                  onChange={(e) => {
                    const currentValue = Array.isArray(responseObject.value) ? responseObject.value : [];
                    if (e.target.checked) {
                      handleSimpleValueChange([...currentValue, option]);
                    } else {
                      handleSimpleValueChange(currentValue.filter(v => v !== option));
                    }
                  }}
                  className="form-checkbox"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {(question.allowsPhoto || question.allowsVideo || question.allowsAudio || question.allowsFiles) && (
            <PhotoInput
              mediaUrls={mediaUrls}
              onAddMedia={() => console.log("Adicionar mídia para questão multiple_select")}
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
    case "datetime":
      return (
        <Input
          type="datetime-local"
          value={responseObject.value || ""}
          onChange={(e) => handleSimpleValueChange(e.target.value)}
        />
      );
    case "time":
      return (
        <TimeResponseInput
          value={responseObject.value}
          onChange={(value) => handleValueChange({...responseObject, value})}
        />
      );
    case "date":
      return (
        <DateResponseInput
          value={responseObject.value}
          onChange={(value) => handleValueChange({...responseObject, value})}
        />
      );
    default:
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-700">
            Tipo de resposta não suportado: {responseType}
          </p>
        </div>
      );
  }
}
