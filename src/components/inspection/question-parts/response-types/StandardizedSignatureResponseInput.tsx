import React, { useState } from "react";
import { BaseResponseInput } from "./base/BaseResponseInput";
import { standardizeResponse } from "@/utils/responseTypeStandardization";
import { FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SignatureInput } from "@/components/inspection/SignatureInput";

interface StandardizedSignatureResponseInputProps {
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

export function StandardizedSignatureResponseInput(props: StandardizedSignatureResponseInputProps) {
  const standardResponse = standardizeResponse(props.response);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSignatureSave = (signatureData: string, signerName: string) => {
    const updatedResponse = {
      ...standardResponse,
      value: signerName,
      mediaUrls: [...standardResponse.mediaUrls, signatureData],
      comments: signerName ? `Assinado por: ${signerName}` : standardResponse.comments
    };
    props.onResponseChange(updatedResponse);
    setIsDialogOpen(false);
  };

  const hasSignature = standardResponse.value || standardResponse.mediaUrls.length > 0;

  return (
    <BaseResponseInput {...props}>
      <div className="space-y-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant={hasSignature ? "outline" : "default"}
              className="w-full flex items-center gap-2"
              disabled={props.readOnly}
            >
              <FileSignature className="h-4 w-4" />
              {hasSignature ? "Alterar Assinatura" : "Adicionar Assinatura"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assinatura Digital</DialogTitle>
            </DialogHeader>
            <SignatureInput
              onSave={handleSignatureSave}
              title="Assinatura"
              defaultName=""
            />
          </DialogContent>
        </Dialog>
        
        {hasSignature && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 text-green-700">
              <FileSignature className="h-4 w-4" />
              <span className="text-sm font-medium">
                Assinatura: {standardResponse.value || "Assinado"}
              </span>
            </div>
          </div>
        )}
      </div>
    </BaseResponseInput>
  );
}