
import React, { useState, useCallback } from "react";
import { StandardActionButtons } from "./StandardActionButtons";
import { MediaUploadInput } from "@/components/inspection/question-inputs/MediaUploadInput";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { ActionPlan5W2HDialog } from "@/components/action-plans/ActionPlan5W2HDialog";
import { YesNoResponseInput } from "./response-types/YesNoResponseInput";
import { TextResponseInput } from "./response-types/TextResponseInput";
import { ParagraphResponseInput } from "./response-types/ParagraphResponseInput";
import { EnhancedMultipleChoiceInput } from "./response-types/EnhancedMultipleChoiceInput";
import { NumberResponseInput } from "./response-types/NumberResponseInput";
import { DateInput } from "@/components/inspection/question-inputs/DateInput";
import { TimeInput } from "@/components/inspection/question-inputs/TimeInput";
import { DateTimeResponseInput } from "./response-types/DateTimeResponseInput";
import { PhotoInput } from "@/components/inspection/question-inputs/PhotoInput";
import { SignatureInput } from "@/components/checklist/SignatureInput";
import { convertToFrontendType } from "@/types/responseTypes";
import { MediaAnalysisResult, Plan5W2H } from "@/hooks/useMediaAnalysis";

interface UnifiedResponseInputProps {
  question: any;
  response: any;
  inspectionId?: string;
  onResponseChange: (value: any) => void;
  onMediaChange?: (mediaUrls: string[]) => void;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  readOnly?: boolean;
}

export function UnifiedResponseInput({
  question,
  response,
  inspectionId,
  onResponseChange,
  onMediaChange,
  actionPlan,
  onSaveActionPlan,
  readOnly = false
}: UnifiedResponseInputProps) {
  const rawResponseType = question.responseType || question.tipo_resposta || "text";
  const responseType = convertToFrontendType(rawResponseType);

  // Estados para modais
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);
  const [ia5W2Hplan, setIa5W2Hplan] = useState<Plan5W2H | null>(null);

  // Garantir estrutura consistente do response
  const safeResponse = {
    value: response?.value,
    mediaUrls: Array.isArray(response?.mediaUrls) ? response.mediaUrls : [],
    mediaAnalysisResults: response?.mediaAnalysisResults || {},
    comment: response?.comment || "",
    actionPlan: response?.actionPlan || "",
    ...response
  };

  const mediaUrls = safeResponse.mediaUrls;
  const mediaAnalysisResults = safeResponse.mediaAnalysisResults;

  // Handlers para modais
  const handleOpenAnalysis = useCallback(() => {
    if (!readOnly && mediaUrls.length > 0) {
      setIsAnalysisOpen(true);
    }
  }, [readOnly, mediaUrls.length]);

  const handleOpenActionPlan = useCallback(() => {
    if (!readOnly) {
      setIsActionPlanOpen(true);
    }
  }, [readOnly]);

  const handleAdd5W2HActionPlan = useCallback((plan: Plan5W2H) => {
    if (!readOnly) {
      setIa5W2Hplan(plan);
      setIsActionPlanOpen(true);
    }
  }, [readOnly]);

  // Handler de mídia centralizado
  const handleMediaChange = useCallback((urls: string[]) => {
    if (!readOnly) {
      const updatedResponse = { ...safeResponse, mediaUrls: urls };
      onResponseChange(updatedResponse);
      if (onMediaChange) onMediaChange(urls);
    }
  }, [safeResponse, onResponseChange, onMediaChange, readOnly]);

  // Handler de análise
  const handleAnalysisComplete = useCallback((url: string, result: MediaAnalysisResult) => {
    if (readOnly) return;
    
    const cleanResult: MediaAnalysisResult = JSON.parse(JSON.stringify(result));
    const updatedResults = {
      ...mediaAnalysisResults,
      [url]: cleanResult
    };

    const updatedResponse = {
      ...safeResponse,
      mediaAnalysisResults: updatedResults
    };

    onResponseChange(updatedResponse);
  }, [mediaAnalysisResults, safeResponse, onResponseChange, readOnly]);

  // Tipo de mídia primária para análise
  const getPrimaryMediaType = () => {
    if (!mediaUrls || mediaUrls.length === 0) return undefined;
    const url = mediaUrls[0];
    if (!url) return undefined;
    const ext = url.split('.').pop()?.toLowerCase() || "";
    if (ext === "webm") {
      if (url.toLowerCase().includes('/audio/') || url.toLowerCase().endsWith('audio.webm')) {
        return "audio";
      }
      return "video";
    }
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return "audio";
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    return undefined;
  };

  // Renderizar o input de resposta específico
  const renderResponseInput = () => {
    switch (responseType) {
      case "yes_no":
        return (
          <YesNoResponseInput
            question={question}
            response={safeResponse}
            onResponseChange={onResponseChange}
            readOnly={readOnly}
          />
        );

      case "text":
        return (
          <TextResponseInput
            question={question}
            response={safeResponse}
            onResponseChange={onResponseChange}
            readOnly={readOnly}
          />
        );

      case "paragraph":
        return (
          <ParagraphResponseInput
            value={safeResponse.value}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
            readOnly={readOnly}
          />
        );

      case "multiple_choice":
      case "checkboxes":
      case "dropdown":
        return (
          <EnhancedMultipleChoiceInput
            question={question}
            value={safeResponse.value || {}}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
            readOnly={readOnly}
          />
        );

      case "numeric":
        return (
          <NumberResponseInput
            question={question}
            value={safeResponse.value}
            response={safeResponse}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
            readOnly={readOnly}
          />
        );

      case "date":
        return (
          <DateInput
            value={safeResponse.value}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
            readOnly={readOnly}
          />
        );

      case "time":
        return (
          <TimeInput
            value={safeResponse.value}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
            readOnly={readOnly}
          />
        );

      case "datetime":
        return (
          <DateTimeResponseInput
            value={safeResponse.value}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
            readOnly={readOnly}
          />
        );

      case "photo":
        return (
          <PhotoInput
            mediaUrls={mediaUrls}
            onAddMedia={() => {}}
            onDeleteMedia={url => handleMediaChange(mediaUrls.filter((mediaUrl: any) => mediaUrl !== url))}
            allowsPhoto={true}
            allowsVideo={question.allowsVideo}
            allowsAudio={question.allowsAudio}
            allowsFiles={question.allowsFiles}
          />
        );

      case "signature":
        return (
          <SignatureInput
            value={safeResponse.value || ""}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
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
  };

  return (
    <div className="space-y-4">
      {/* Input de resposta específico */}
      {renderResponseInput()}

      {/* Botões de ação padrão - apenas para tipos que suportam mídia/análise/ações */}
      {!readOnly && !["signature"].includes(responseType) && (
        <StandardActionButtons
          question={question}
          readOnly={readOnly}
          onOpenAnalysis={mediaUrls.length > 0 ? handleOpenAnalysis : undefined}
          onActionPlanClick={inspectionId && question.id && onSaveActionPlan ? handleOpenActionPlan : undefined}
          mediaUrls={mediaUrls}
          mediaAnalysisResults={mediaAnalysisResults}
          dummyProp="StandardizedFooter"
        />
      )}

      {/* Upload de mídia - apenas para tipos que suportam */}
      {!readOnly && !["signature", "date", "time", "datetime"].includes(responseType) && (
        <MediaUploadInput
          mediaUrls={mediaUrls}
          onMediaChange={handleMediaChange}
          allowsPhoto={question.allowsPhoto || question.permite_foto || false}
          allowsVideo={question.allowsVideo || question.permite_video || false}
          allowsAudio={question.allowsAudio || question.permite_audio || false}
          allowsFiles={question.allowsFiles || question.permite_files || false}
          readOnly={readOnly}
          questionText={question.text || question.pergunta || ""}
        />
      )}

      {/* Modal de análise de mídia */}
      {!readOnly && (
        <MediaAnalysisDialog
          open={isAnalysisOpen}
          onOpenChange={setIsAnalysisOpen}
          mediaUrl={mediaUrls && mediaUrls.length > 0 ? mediaUrls[0] : null}
          mediaType={getPrimaryMediaType()}
          questionText={question.text || question.pergunta || ""}
          userAnswer={
            safeResponse?.value === true ? "Sim" : 
            safeResponse?.value === false ? "Não" : 
            String(safeResponse?.value || "")
          }
          multimodalAnalysis={true}
          mediaUrls={mediaUrls}
          onAnalysisComplete={handleAnalysisComplete}
          onAdd5W2HActionPlan={handleAdd5W2HActionPlan}
        />
      )}

      {/* Modal de plano de ação */}
      {!readOnly && inspectionId && question.id && onSaveActionPlan && (
        <ActionPlan5W2HDialog
          open={isActionPlanOpen}
          onOpenChange={setIsActionPlanOpen}
          questionId={question.id}
          inspectionId={inspectionId}
          existingPlan={actionPlan}
          onSave={async (data: any) => {
            await onSaveActionPlan(data);
            setIsActionPlanOpen(false);
          }}
          iaSuggestions={mediaAnalysisResults}
          ia5W2Hplan={ia5W2Hplan}
        />
      )}
    </div>
  );
}
