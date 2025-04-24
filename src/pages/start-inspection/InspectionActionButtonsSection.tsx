import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, ChevronRight } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface InspectionActionButtonsSectionProps {
  isLoading: boolean;
  submitting: string | boolean;
  cancelAndGoBack: () => void;
  saveAsDraft: () => Promise<string | false>;
  handleShare: () => Promise<void>;
  inspectionId?: string;
}

export default function InspectionActionButtonsSection({
  isLoading,
  submitting,
  cancelAndGoBack,
  saveAsDraft,
  handleShare,
  inspectionId
}: InspectionActionButtonsSectionProps) {
  const { handleSubmit } = useFormContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle inspection start
  const handleStartInspection = async (formData?: any) => {
    if (isSubmitting) {
      console.log("Preventing duplicate submission - already in progress");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await window.startInspection?.();
      
      if (result?.success && result.inspectionId) {
        console.log(`Inspection created successfully: ${result.inspectionId}`);
        localStorage.removeItem('inspection_draft');
        navigate(`/inspections/${result.inspectionId}/view`, { replace: true });
      }
    } catch (error) {
      console.error("Error starting inspection:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-6">
      <Button
        variant="outline"
        onClick={cancelAndGoBack}
        disabled={isLoading || !!submitting || isSubmitting}
        type="button"
      >
        Cancelar
      </Button>
      
      <Button
        variant="outline"
        onClick={saveAsDraft}
        disabled={isLoading || !!submitting || isSubmitting}
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
        disabled={isLoading || !!submitting || isSubmitting}
        type="button"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Compartilhar
      </Button>
      
      <Button
        onClick={handleSubmit(handleStartInspection)}
        disabled={isLoading || !!submitting || isSubmitting}
        type="button"
      >
        {submitting === "pending" || isSubmitting ? (
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
