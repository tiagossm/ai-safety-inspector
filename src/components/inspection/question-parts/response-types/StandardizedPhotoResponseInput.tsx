import React from "react";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse } from "@/utils/responseTypeStandardization";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StandardizedPhotoResponseInputProps {
  question: any;
  response: any;
  onResponseChange: (data: any) => void;
  inspectionId?: string;
  actionPlan?: any;
  onSaveActionPlan?: (data: any) => Promise<void>;
  onMediaChange?: (mediaUrls: string[]) => void;
  onApplyAISuggestion?: (suggestion: string) => void;
  readOnly?: boolean;
}

export function StandardizedPhotoResponseInput(props: StandardizedPhotoResponseInputProps) {
  const standardResponse = standardizeResponse(props.response);

  const handlePhotoCapture = () => {
    // Lógica básica para captura de foto - pode ser expandida conforme necessário
    // Por enquanto, apenas indica que uma foto foi capturada
    const updatedResponse = {
      ...standardResponse,
      value: "photo_captured",
      mediaUrls: [...standardResponse.mediaUrls, `photo_${Date.now()}.jpg`]
    };
    props.onResponseChange(updatedResponse);
  };

  return (
    <BaseResponseInput 
      {...props}
      showMediaUpload={true}
      showMediaAnalysis={true}
    >
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handlePhotoCapture}
          disabled={props.readOnly}
        >
          <Camera className="h-4 w-4" />
          {standardResponse.mediaUrls.length > 0 ? "Adicionar Outra Foto" : "Capturar Foto"}
        </Button>
        
        {standardResponse.mediaUrls.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {standardResponse.mediaUrls.length} foto(s) capturada(s)
          </div>
        )}
      </div>
    </BaseResponseInput>
  );
}