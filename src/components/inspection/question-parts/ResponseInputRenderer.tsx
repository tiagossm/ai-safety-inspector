import React, { useCallback, useState } from "react";
import { StandardActionButtons } from "./StandardActionButtons";
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
import { MediaAnalysisResult } from "@/hooks/useMediaAnalysis";

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

  const safeResponse = response || {};
  const mediaUrls = safeResponse.mediaUrls || [];
  const mediaAnalysisResults = safeResponse.mediaAnalysisResults || {};

  // Para análise IA modal
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);

  // Handler de mídia centralizado
  const handleMediaChange = useCallback((urls: string[]) => {
    const updatedResponse = { ...safeResponse, mediaUrls: urls };
    onResponseChange(updatedResponse);
    if (onMediaChange) onMediaChange(urls);
  }, [safeResponse, onResponseChange, onMediaChange]);

  // Handler análise IA centralizado para abrir modal
  const handleOpenAnalysis = useCallback(() => {
    if (mediaUrls && mediaUrls.length > 0) {
      setSelectedMediaUrl(mediaUrls[0]);
    } else {
      setSelectedMediaUrl(null);
    }
    setIsAnalysisOpen(true);
  }, [mediaUrls]);

  // Handler para salvar análise e atualizar response
  const handleAnalysisComplete = useCallback((result: MediaAnalysisResult) => {
    if (selectedMediaUrl) {
      const updatedResults = { ...mediaAnalysisResults, [selectedMediaUrl]: result };
      const updatedResponse = {
        ...safeResponse,
        mediaAnalysisResults: updatedResults
      };
      onResponseChange(updatedResponse);
    }
  }, [selectedMediaUrl, mediaAnalysisResults, safeResponse, onResponseChange]);

  switch (responseType) {
    case "yes_no":
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
        />
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
            inspectionId={inspectionId}
            response={safeResponse}
            actionPlan={actionPlan}
            onSaveActionPlan={onSaveActionPlan}
            mediaUrls={mediaUrls}
            readOnly={readOnly}
            mediaAnalysisResults={mediaAnalysisResults}
            onOpenAnalysis={handleOpenAnalysis}
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
            onSaveAnalysis={(url: string, result: MediaAnalysisResult) => {
              const updatedResults = { ...mediaAnalysisResults, [url]: result };
              const updatedResponse = {
                ...safeResponse,
                mediaAnalysisResults: updatedResults
              };
              onResponseChange(updatedResponse);
            }}
            analysisResults={mediaAnalysisResults}
          />
          <MediaAnalysisDialog
            open={isAnalysisOpen}
            onOpenChange={setIsAnalysisOpen}
            mediaUrl={selectedMediaUrl}
            questionText={question.text || question.pergunta || ""}
            multimodalAnalysis={true}
            additionalMediaUrls={mediaUrls}
            onAnalysisComplete={handleAnalysisComplete}
          />
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
            inspectionId={inspectionId}
            response={safeResponse}
            actionPlan={actionPlan}
            onSaveActionPlan={onSaveActionPlan}
            mediaUrls={mediaUrls}
            readOnly={readOnly}
            mediaAnalysisResults={mediaAnalysisResults}
            onOpenAnalysis={handleOpenAnalysis}
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
          <MediaAnalysisDialog
            open={isAnalysisOpen}
            onOpenChange={setIsAnalysisOpen}
            mediaUrl={selectedMediaUrl}
            questionText={question.text || question.pergunta || ""}
            multimodalAnalysis={true}
            additionalMediaUrls={mediaUrls}
            onAnalysisComplete={handleAnalysisComplete}
          />
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
          <StandardActionButtons
            question={question}
            inspectionId={inspectionId}
            response={safeResponse}
            actionPlan={actionPlan}
            onSaveActionPlan={onSaveActionPlan}
            mediaUrls={mediaUrls}
            readOnly={readOnly}
            mediaAnalysisResults={mediaAnalysisResults}
            onOpenAnalysis={handleOpenAnalysis}
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
          <MediaAnalysisDialog
            open={isAnalysisOpen}
            onOpenChange={setIsAnalysisOpen}
            mediaUrl={selectedMediaUrl}
            questionText={question.text || question.pergunta || ""}
            multimodalAnalysis={true}
            additionalMediaUrls={mediaUrls}
            onAnalysisComplete={handleAnalysisComplete}
          />
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
            onMediaChange={handleMediaChange}
            inspectionId={inspectionId}
            actionPlan={actionPlan}
            onSaveActionPlan={onSaveActionPlan}
            readOnly={readOnly}
          />
          <StandardActionButtons
            question={question}
            inspectionId={inspectionId}
            response={safeResponse}
            actionPlan={actionPlan}
            onSaveActionPlan={onSaveActionPlan}
            mediaUrls={mediaUrls}
            readOnly={readOnly}
            mediaAnalysisResults={mediaAnalysisResults}
            onOpenAnalysis={handleOpenAnalysis}
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
          <MediaAnalysisDialog
            open={isAnalysisOpen}
            onOpenChange={setIsAnalysisOpen}
            mediaUrl={selectedMediaUrl}
            questionText={question.text || question.pergunta || ""}
            multimodalAnalysis={true}
            additionalMediaUrls={mediaUrls}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </div>
      );
    case "photo":
      return (
        <div className="space-y-4">
          <PhotoInput
            mediaUrls={mediaUrls}
            onAddMedia={() => {}} // já tratado via MediaUploadInput
            onDeleteMedia={url => handleMediaChange(mediaUrls.filter((mediaUrl: any) => mediaUrl !== url))}
            allowsPhoto={true}
            allowsVideo={question.allowsVideo}
            allowsAudio={question.allowsAudio}
            allowsFiles={question.allowsFiles}
          />
          <StandardActionButtons
            question={question}
            inspectionId={inspectionId}
            response={safeResponse}
            actionPlan={actionPlan}
            onSaveActionPlan={onSaveActionPlan}
            mediaUrls={mediaUrls}
            readOnly={readOnly}
            mediaAnalysisResults={mediaAnalysisResults}
            onOpenAnalysis={handleOpenAnalysis}
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
          <MediaAnalysisDialog
            open={isAnalysisOpen}
            onOpenChange={setIsAnalysisOpen}
            mediaUrl={selectedMediaUrl}
            questionText={question.text || question.pergunta || ""}
            multimodalAnalysis={true}
            additionalMediaUrls={mediaUrls}
            onAnalysisComplete={handleAnalysisComplete}
          />
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
            inspectionId={inspectionId}
            response={safeResponse}
            actionPlan={actionPlan}
            onSaveActionPlan={onSaveActionPlan}
            mediaUrls={mediaUrls}
            readOnly={readOnly}
            mediaAnalysisResults={mediaAnalysisResults}
            onOpenAnalysis={handleOpenAnalysis}
          />
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
            inspectionId={inspectionId}
            response={safeResponse}
            actionPlan={actionPlan}
            onSaveActionPlan={onSaveActionPlan}
            mediaUrls={mediaUrls}
            readOnly={readOnly}
            mediaAnalysisResults={mediaAnalysisResults}
            onOpenAnalysis={handleOpenAnalysis}
          />
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
            inspectionId={inspectionId}
            response={safeResponse}
            actionPlan={actionPlan}
            onSaveActionPlan={onSaveActionPlan}
            mediaUrls={mediaUrls}
            readOnly={readOnly}
            mediaAnalysisResults={mediaAnalysisResults}
            onOpenAnalysis={handleOpenAnalysis}
          />
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
            inspectionId={inspectionId}
            response={safeResponse}
            actionPlan={actionPlan}
            onSaveActionPlan={onSaveActionPlan}
            mediaUrls={mediaUrls}
            readOnly={readOnly}
            mediaAnalysisResults={mediaAnalysisResults}
            onOpenAnalysis={handleOpenAnalysis}
          />
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
