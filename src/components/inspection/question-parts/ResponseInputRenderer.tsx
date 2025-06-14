
import React, { useCallback, useState } from "react";
import { ResponseButtonGroup } from "./response-types/components/ResponseButtonGroup";
import { ActionPlanButton } from "./response-types/components/ActionPlanButton";
import { MediaAnalysisButton } from "./response-types/components/MediaAnalysisButton";
import { MediaUploadInput } from "@/components/inspection/question-inputs/MediaUploadInput";
import { MediaAnalysisDialog } from "@/components/media/MediaAnalysisDialog";
import { MediaAttachments } from "@/components/inspection/question-inputs/MediaAttachments";
import { YesNoResponseInput } from "./response-types/YesNoResponseInput";
import { TextResponseInput } from "./response-types/TextResponseInput";
import { ParagraphResponseInput } from "./response-types/ParagraphResponseInput";
import { CheckboxesResponseInput } from "./response-types/CheckboxesResponseInput";
import { DropdownResponseInput } from "./response-types/DropdownResponseInput";
import { DateTimeResponseInput } from "./response-types/DateTimeResponseInput";
import { DateInput } from "@/components/inspection/question-inputs/DateInput";
import { TimeInput } from "@/components/inspection/question-inputs/TimeInput";
import { NumberInput } from "@/components/inspection/question-inputs/NumberInput";
import { PhotoInput } from "@/components/inspection/question-inputs/PhotoInput";
import { SignatureInput } from "@/components/checklist/SignatureInput";
import { EnhancedMultipleChoiceInput } from "./response-types/EnhancedMultipleChoiceInput";
import { convertToFrontendType, validateResponseValue, TYPES_REQUIRING_OPTIONS } from "@/types/responseTypes";

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
  // Normalizar tipo de resposta para formato padrão
  const rawResponseType = question.responseType || question.tipo_resposta || "text";
  const responseType = convertToFrontendType(rawResponseType);

  // Ensure response is always an object (even if empty)
  const safeResponse = response || {};
  const mediaUrls = safeResponse.mediaUrls || [];

  // Incluir state para análise, plano de ação e preview de mídia, comum para todos tipos
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [isActionPlanOpen, setIsActionPlanOpen] = useState(false);

  // Handler de mídia centralizado
  const handleMediaChange = useCallback((urls: string[]) => {
    const updatedResponse = {
      ...safeResponse,
      mediaUrls: urls
    };
    onResponseChange(updatedResponse);
    if (onMediaChange) onMediaChange(urls);
  }, [safeResponse, onResponseChange, onMediaChange]);

  // Handler de plano de ação centralizado
  const handleActionPlanClick = useCallback(() => {
    setIsActionPlanOpen(true);
  }, []);

  // Handler para abrir análise de IA
  const handleOpenAnalysis = useCallback(() => {
    if (safeResponse.mediaUrls && safeResponse.mediaUrls.length > 0) {
      setSelectedMediaUrl(safeResponse.mediaUrls[0]);
    } else {
      setSelectedMediaUrl(null);
    }
    setIsAnalysisOpen(true);
  }, [safeResponse.mediaUrls]);

  // Handler para salvar uma sugestão da IA como plano de ação (fica para o futuro)
  const handleApplyAISuggestion = useCallback((suggestion: string) => {
    // Aqui pode implementar, se necessário (já previsível)
  }, []);

  // Handler para salvar análise de mídia (padrão)
  const handleAnalysisResults = useCallback((results: any) => {
    const updatedResponse = {
      ...safeResponse,
      mediaAnalysisResults: {
        ...(safeResponse?.mediaAnalysisResults || {}),
        ...results,
      }
    };
    onResponseChange(updatedResponse);

    if (results.actionPlanSuggestion && handleApplyAISuggestion) {
      handleApplyAISuggestion(results.actionPlanSuggestion);
    }
  }, [safeResponse, onResponseChange, handleApplyAISuggestion]);

  // Estrutura comum para botões: mídia, plano de ação e IA
  const StandardMediaAndActionRow = (
    <div className="flex flex-wrap gap-2 mt-2 mb-1">
      <ActionPlanButton 
        onActionPlanClick={handleActionPlanClick}
        readOnly={readOnly}
      />
      <MediaAnalysisButton onOpenAnalysis={handleOpenAnalysis} />
    </div>
  );

  // Estrutura comum do input de mídia e anexos
  const StandardMediaInputs = (
    <>
      <MediaUploadInput
        mediaUrls={mediaUrls}
        onMediaChange={handleMediaChange}
        allowsPhoto={question.allowsPhoto || question.permite_foto || false}
        allowsVideo={question.allowsVideo || question.permite_video || false}
        allowsAudio={question.allowsAudio || question.permite_audio || false}
        allowsFiles={question.allowsFiles || question.permite_files || false}
        readOnly={readOnly}
        questionText={question.text || question.pergunta || ""}
        onApplyAISuggestion={handleApplyAISuggestion}
      />
      <MediaAnalysisDialog
        open={isAnalysisOpen}
        onOpenChange={setIsAnalysisOpen}
        mediaUrl={selectedMediaUrl}
        questionText={question.text || question.pergunta || ""}
        onAnalysisComplete={handleAnalysisResults}
        multimodalAnalysis={true}
        additionalMediaUrls={mediaUrls}
      />
    </>
  );

  // Renderização centralizada para todos os tipos
  switch (responseType) {
    case "yes_no":
      // Sim/Não já possui a estrutura correta, então só usa o componente.
      return (
        <YesNoResponseInput
          question={question}
          response={safeResponse}
          inspectionId={inspectionId}
          onResponseChange={onResponseChange}
          onMediaChange={handleMediaChange}
          actionPlan={actionPlan}
          onSaveActionPlan={onSaveActionPlan}
          readOnly={readOnly}
          onApplyAISuggestion={handleApplyAISuggestion}
        />
      );
    case "text":
      return (
        <div className="space-y-4">
          <TextResponseInput
            question={question}
            response={safeResponse}
            onResponseChange={onResponseChange}
            // Passar onMediaChange para garantir consistência de atualização
            onMediaChange={handleMediaChange}
            onApplyAISuggestion={handleApplyAISuggestion}
            readOnly={readOnly}
          />
          {StandardMediaAndActionRow}
          {StandardMediaInputs}
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
          {StandardMediaAndActionRow}
          {StandardMediaInputs}
        </div>
      );
    case "multiple_choice":
    case "checkboxes":
    case "dropdown":
      return (
        <div className="space-y-4">
          <EnhancedMultipleChoiceInput
            question={question}
            value={safeResponse}
            onChange={onResponseChange}
            readOnly={readOnly}
          />
          {StandardMediaAndActionRow}
          {StandardMediaInputs}
        </div>
      );
    case "numeric":
      return (
        <div className="space-y-4">
          <NumberInput
            value={safeResponse.value}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
          />
          {StandardMediaAndActionRow}
          {StandardMediaInputs}
        </div>
      );
    case "photo":
      return (
        <div className="space-y-4">
          <PhotoInput
            mediaUrls={mediaUrls}
            onAddMedia={() => {}}  // já tratado via MediaUploadInput
            onDeleteMedia={url => handleMediaChange(mediaUrls.filter((mediaUrl:any) => mediaUrl !== url))}
            allowsPhoto={true}
            allowsVideo={question.allowsVideo}
            allowsAudio={question.allowsAudio}
            allowsFiles={question.allowsFiles}
          />
          {StandardMediaAndActionRow}
          {StandardMediaInputs}
        </div>
      );
    case "signature":
      return (
        <div className="space-y-4">
          <SignatureInput 
            value={safeResponse.value || ""}
            onChange={val => onResponseChange({ ...safeResponse, value: val })}
          />
          {StandardMediaAndActionRow}
          {StandardMediaInputs}
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
          {StandardMediaAndActionRow}
          {StandardMediaInputs}
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
          {StandardMediaAndActionRow}
          {StandardMediaInputs}
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
          {StandardMediaAndActionRow}
          {StandardMediaInputs}
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
