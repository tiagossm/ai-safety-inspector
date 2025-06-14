
import React from "react";
import { Input } from "@/components/ui/input";
import { StandardActionButtons } from "../StandardActionButtons";
import { MediaUploadInput } from "@/components/inspection/question-inputs/MediaUploadInput";

interface NumberResponseInputProps {
  question: any;
  value?: number | string;
  response?: any;
  onChange: (value: number | string) => void;
  onMediaChange?: (mediaUrls: string[]) => void;
  inspectionId?: string;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  readOnly?: boolean;
}

export function NumberResponseInput({
  question,
  value,
  response = {},
  onChange,
  onMediaChange,
  inspectionId,
  actionPlan,
  onSaveActionPlan,
  readOnly = false
}: NumberResponseInputProps) {
  const mediaUrls = response?.mediaUrls || [];
  const mediaAnalysisResults = response?.mediaAnalysisResults || {};

  return (
    <div className="space-y-3">
      <Input
        type="number"
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder="Digite o valor numérico"
      />
      <StandardActionButtons
        question={question}
        inspectionId={inspectionId}
        response={response}
        actionPlan={actionPlan}
        onSaveActionPlan={onSaveActionPlan}
        mediaUrls={mediaUrls}
        readOnly={readOnly}
        mediaAnalysisResults={mediaAnalysisResults}
        // Não é necessário onOpenAnalysis aqui, já está centralizado no uso do StandardActionButtons
      />
      <MediaUploadInput
        mediaUrls={mediaUrls}
        onMediaChange={onMediaChange}
        allowsPhoto={question.allowsPhoto || question.permite_foto || false}
        allowsVideo={question.allowsVideo || question.permite_video || false}
        allowsAudio={question.allowsAudio || question.permite_audio || false}
        allowsFiles={question.allowsFiles || question.permite_files || false}
        readOnly={readOnly}
        questionText={question.text || question.pergunta || ""}
      />
    </div>
  );
}
