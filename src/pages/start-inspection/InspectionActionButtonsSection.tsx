
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, ChevronRight } from "lucide-react";
import { useFormContext } from "react-hook-form";

interface InspectionActionButtonsSectionProps {
  isLoading: boolean;
  submitting: string | boolean;
  cancelAndGoBack: () => void;
  saveAsDraft: () => Promise<string | false>;
  handleShare: () => Promise<void>;
  handleStartInspection: () => Promise<boolean>;
}

export default function InspectionActionButtonsSection({
  isLoading,
  submitting,
  cancelAndGoBack,
  saveAsDraft,
  handleShare,
  handleStartInspection,
}: InspectionActionButtonsSectionProps) {
  const { handleSubmit } = useFormContext();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const onSubmit = handleSubmit(async () => {
    if (hasSubmitted) {
      console.log("Form already submitted, preventing duplicate submission");
      return;
    }
    
    try {
      setHasSubmitted(true);
      await handleStartInspection();
    } catch (error) {
      console.error("Error during form submission:", error);
      setHasSubmitted(false); // Reset on error
    }
  });

  return (
    <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-6">
      <Button
        variant="outline"
        onClick={cancelAndGoBack}
        disabled={isLoading || !!submitting || hasSubmitted}
        type="button"
      >
        Cancelar
      </Button>
      <Button
        variant="outline"
        onClick={saveAsDraft}
        disabled={isLoading || !!submitting || hasSubmitted}
        type="button"
      >
        {submitting === "draft" ? (
          <>
            <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
            Salvando...
          </>
        ) : (
          "Salvar como Rascunho"
        )}
      </Button>
      <Button
        variant="outline"
        onClick={handleShare}
        disabled={isLoading || !!submitting || hasSubmitted}
        type="button"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Compartilhar
      </Button>
      <Button
        onClick={onSubmit}
        type="button"
        disabled={isLoading || !!submitting || hasSubmitted}
      >
        {submitting === "pending" ? (
          <>
            <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
            Iniciando...
          </>
        ) : (
          <>
            Iniciar Inspeção
            <ChevronRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
