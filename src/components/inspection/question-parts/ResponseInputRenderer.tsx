
import React, { useCallback, useState } from "react";
import { StandardActionButtons, StandardActionButtonsProps } from "./StandardActionButtons";
import { MediaUploadInput } from "@/components/inspection/question-inputs/MediaUploadInput";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { EnhancedMultipleChoiceInput } from "./response-types/EnhancedMultipleChoiceInput";
import { YesNoResponseInput } from "./response-types/YesNoResponseInput";
import { TextResponseInput } from "./response-types/TextResponseInput";
import { ParagraphResponseInput } from "./response-types/ParagraphResponseInput";
import { CheckboxesResponseInput } from "./response-types/CheckboxesResponseInput";
import { DropdownResponseInput } from "./response-types/DropdownResponseInput";
import { DateTimeResponseInput } from "./response-types/DateTimeResponseInput";
import { DateInput } from "@/components/inspection/question-inputs/DateInput";
import { TimeInput } from "@/components/inspection/question-inputs/TimeInput";
import { NumberResponseInput } from "./response-types/NumberResponseInput";
import { PhotoInput } from "@/components/inspection/question-inputs/PhotoInput";
import { SignatureInput } from "@/components/checklist/SignatureInput";
import { convertToFrontendType } from "@/types/responseTypes";
import { MediaAnalysisResult, Plan5W2H } from "@/hooks/useMediaAnalysis";
import { ActionPlan5W2HDialog } from "@/components/action-plans/ActionPlan5W2HDialog";

interface ResponseInputRendererProps {
  question: any;
  response: any;
  inspectionId?: string;
  onResponseChange: (value: any) => void;
  onMediaChange?: (mediaUrls: string[]) => void;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  readOnly?: boolean;
}

export const ResponseInputRenderer: React.FC<ResponseInputRendererProps> = ({
  question,
  response,
  inspectionId,
  onResponseChange,
  onMediaChange,
  actionPlan,
  onSaveActionPlan,
  readOnly = false
}) => {
  const rawResponseType = question.responseType || question.tipo_resposta || "text";
  const responseType = convertToFrontendType(rawResponseType);

  // Garantir estrutura consistente do response
  const safeResponse = {
    value: response?.value,
    mediaUrls: Array.isArray(response?.mediaUrls) ? response.mediaUrls : [],
    mediaAnalysisResults: response?.mediaAnalysisResults || {},
    ...response
  };

  const mediaUrls = safeResponse.mediaUrls;
  const mediaAnalysisResults = safeResponse.mediaAnalysisResults;

  // Estados centralizados para modais
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isActionPlanDialogOpen, setIsActionPlanDialogOpen] = useState(false);
  const [ia5W2Hplan, setIa5W2Hplan] = useState<Plan5W2H | null>(null);

  // --- NOVO: Corrigir/implementar handleAdd5W2HActionPlan e handleOpenActionPlan
  const handleAdd5W2HActionPlan = useCallback((plan: Plan5W2H) => {
    setIa5W2Hplan(plan);
    setIsActionPlanDialogOpen(true);
  }, []);

  const handleOpenActionPlan = useCallback(() => {
    setIsActionPlanDialogOpen(true);
  }, []);

  // Handler de mídia centralizado
  const handleMediaChange = useCallback((urls: string[]) => {
    const updatedResponse = { ...safeResponse, mediaUrls: urls };
    onResponseChange(updatedResponse);
    if (onMediaChange) onMediaChange(urls);
  }, [safeResponse, onResponseChange, onMediaChange]);

  // Handler análise IA centralizado
  const handleOpenAnalysis = useCallback(() => {
    setIsAnalysisOpen(true);
  }, []);

  // Modificado: ao passar para o MediaAnalysisDialog, envia mediaType correto para .webm áudio
  const getPrimaryMediaType = () => {
    if (!mediaUrls || mediaUrls.length === 0) return undefined;
    const url = mediaUrls[0];
    if (!url) return undefined;
    const ext = url.split('.').pop()?.toLowerCase() || "";
    if (ext === "webm") {
      // Heurística do MediaAttachmentRenderer
      if (url.toLowerCase().includes('/audio/') || url.toLowerCase().endsWith('audio.webm')) {
        return "audio";
      }
      return "video";
    }
    // Restante: texto de fallback
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return "audio";
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    return undefined;
  };

  // Handler para salvar análise e atualizar response
  const handleAnalysisComplete = useCallback((url: string, result: MediaAnalysisResult) => {
    console.log(`[ResponseInputRenderer] Análise completa para ${url}`, result);

    // Garante que não existe referência circular ou deep response indexado:
    const cleanResult: MediaAnalysisResult = JSON.parse(JSON.stringify(result));

    const updatedResults = {
      ...mediaAnalysisResults,
      [url]: cleanResult
    };

    const updatedResponse = {
      ...safeResponse,
      mediaAnalysisResults: updatedResults
    };

    // Nunca enviar funções, nunca incluir subChecklistResponses, manter apenas fields esperados
    delete updatedResponse.subChecklistResponses;
    if (updatedResponse.mediaAnalysisResults) {
      Object.values(updatedResponse.mediaAnalysisResults).forEach((val: any) => {
        if (val && typeof val === "object" && typeof val.subChecklistResponses !== "undefined") {
          delete val.subChecklistResponses;
        }
      });
    }

    onResponseChange(updatedResponse);
  }, [mediaAnalysisResults, safeResponse, onResponseChange]);

  // Componentes de modal centralizados
  const actionPlanDialog = (
    <ActionPlan5W2HDialog
      open={isActionPlanDialogOpen}
      onOpenChange={setIsActionPlanDialogOpen}
      questionId={question?.id}
      inspectionId={inspectionId}
      existingPlan={actionPlan}
      onSave={async (data: any) => {
        await onSaveActionPlan?.(data);
        setIsActionPlanDialogOpen(false);
      }}
      iaSuggestions={mediaAnalysisResults}
      ia5W2Hplan={ia5W2Hplan}
    />
  );

  const mediaAnalysisDialog = (
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
  );

  switch (responseType) {
    case "yes_no":
      return (
        <div className="space-y-4">
          <YesNoResponseInput
            question={question}
            response={safeResponse}
            onResponseChange={onResponseChange}
            readOnly={readOnly}
          />
          <StandardActionButtons
            question={question}
            readOnly={readOnly}
            onOpenAnalysis={handleOpenAnalysis}
            onActionPlanClick={handleOpenActionPlan}
            mediaUrls={mediaUrls}
            mediaAnalysisResults={mediaAnalysisResults}
            dummyProp="UniqueKeyForProps20250615"
          />
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
          {mediaAnalysisDialog}
          {actionPlanDialog}
        </div>
      );

    case "text":
      return (
        <div className="space-y-4">
          <TextResponseInput
            question={question}
            response={safeResponse}
            onResponseChange={onResponseChange}
            readOnly={readOnly}
          />
          <StandardActionButtons
            question={question}
            readOnly={readOnly}
            onOpenAnalysis={handleOpenAnalysis}
            onActionPlanClick={handleOpenActionPlan}
            mediaUrls={mediaUrls}
            mediaAnalysisResults={mediaAnalysisResults}
            dummyProp="UniqueKeyForProps20250615"
          />
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
          {mediaAnalysisDialog}
          {actionPlanDialog}
        </div>
      );

    case "paragraph":
      return (
        <div className="space-y-4">
          <ParagraphResponseInput
            value={safeResponse.value}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
            readOnly={readOnly}
          />
          <StandardActionButtons
            question={question}
            readOnly={readOnly}
            onOpenAnalysis={handleOpenAnalysis}
            onActionPlanClick={handleOpenActionPlan}
            mediaUrls={mediaUrls}
            mediaAnalysisResults={mediaAnalysisResults}
            dummyProp="UniqueKeyForProps20250615"
          />
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
          {mediaAnalysisDialog}
          {actionPlanDialog}
        </div>
      );

    case "multiple_choice":
    case "checkboxes":
    case "dropdown":
      return (
        <div className="space-y-4">
          <EnhancedMultipleChoiceInput
            question={question}
            value={safeResponse.value || {}}
            onChange={val =>
              onResponseChange({
                ...safeResponse,
                value: val
              })
            }
            readOnly={readOnly}
          />
          <StandardActionButtons
            question={question}
            readOnly={readOnly}
            onOpenAnalysis={handleOpenAnalysis}
            onActionPlanClick={handleOpenActionPlan}
            mediaUrls={mediaUrls}
            mediaAnalysisResults={mediaAnalysisResults}
            dummyProp="UniqueKeyForProps20250615"
          />
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
          {mediaAnalysisDialog}
          {actionPlanDialog}
        </div>
      );

    case "numeric":
      return (
        <div className="space-y-4">
          <NumberResponseInput
            question={question}
            value={safeResponse.value}
            response={safeResponse}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
            readOnly={readOnly}
          />
          <StandardActionButtons
            question={question}
            readOnly={readOnly}
            onOpenAnalysis={handleOpenAnalysis}
            onActionPlanClick={handleOpenActionPlan}
            mediaUrls={mediaUrls}
            mediaAnalysisResults={mediaAnalysisResults}
            dummyProp="UniqueKeyForProps20250615"
          />
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
          {mediaAnalysisDialog}
          {actionPlanDialog}
        </div>
      );

    case "photo":
      return (
        <div className="space-y-4">
          <PhotoInput
            mediaUrls={mediaUrls}
            onAddMedia={() => {}}
            onDeleteMedia={url => handleMediaChange(mediaUrls.filter((mediaUrl: any) => mediaUrl !== url))}
            allowsPhoto={true}
            allowsVideo={question.allowsVideo}
            allowsAudio={question.allowsAudio}
            allowsFiles={question.allowsFiles}
          />
          <StandardActionButtons
            question={question}
            readOnly={readOnly}
            onOpenAnalysis={handleOpenAnalysis}
            onActionPlanClick={handleOpenActionPlan}
            mediaUrls={mediaUrls}
            mediaAnalysisResults={mediaAnalysisResults}
            dummyProp="UniqueKeyForProps20250615"
          />
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
          {mediaAnalysisDialog}
          {actionPlanDialog}
        </div>
      );

    case "signature":
      return (
        <div className="space-y-4">
          <SignatureInput
            value={safeResponse.value || ""}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
          />
          <StandardActionButtons
            question={question}
            readOnly={readOnly}
            onActionPlanClick={handleOpenActionPlan}
            dummyProp="UniqueKeyForProps20250615"
          />
          {actionPlanDialog}
        </div>
      );

    case "date":
      return (
        <div className="space-y-4">
          <DateInput
            value={safeResponse.value}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
            readOnly={readOnly}
          />
          <StandardActionButtons
            question={question}
            readOnly={readOnly}
            onActionPlanClick={handleOpenActionPlan}
            dummyProp="UniqueKeyForProps20250615"
          />
          {actionPlanDialog}
        </div>
      );

    case "time":
      return (
        <div className="space-y-4">
          <TimeInput
            value={safeResponse.value}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
            readOnly={readOnly}
          />
          <StandardActionButtons
            question={question}
            readOnly={readOnly}
            onActionPlanClick={handleOpenActionPlan}
            dummyProp="UniqueKeyForProps20250615"
          />
          {actionPlanDialog}
        </div>
      );

    case "datetime":
      return (
        <div className="space-y-4">
          <DateTimeResponseInput
            value={safeResponse.value}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
            readOnly={readOnly}
          />
          <StandardActionButtons
            question={question}
            readOnly={readOnly}
            onActionPlanClick={handleOpenActionPlan}
            dummyProp="UniqueKeyForProps20250615"
          />
          {actionPlanDialog}
        </div>
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

