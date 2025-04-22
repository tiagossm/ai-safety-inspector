
import React from "react";
import { Button } from "@/components/ui/button";
import { Share2, ChevronRight } from "lucide-react";

interface InspectionActionButtonsSectionProps {
  isLoading: boolean;
  submitting: string | boolean;
  cancelAndGoBack: () => void;
  saveAsDraft: () => Promise<void>;
  handleShare: () => Promise<void>;
  handleStartInspection: () => Promise<void>;
}

export default function InspectionActionButtonsSection({
  isLoading,
  submitting,
  cancelAndGoBack,
  saveAsDraft,
  handleShare,
  handleStartInspection,
}: InspectionActionButtonsSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-6">
      <Button
        variant="outline"
        onClick={cancelAndGoBack}
        disabled={isLoading || !!submitting}
      >
        Cancelar
      </Button>
      <Button
        variant="outline"
        onClick={saveAsDraft}
        disabled={isLoading || !!submitting}
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
        disabled={isLoading || !!submitting}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Compartilhar
      </Button>
      <Button
        onClick={handleStartInspection}
        disabled={isLoading || !!submitting}
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
