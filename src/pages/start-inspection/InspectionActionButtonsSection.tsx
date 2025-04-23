
import React, { useState, useEffect } from "react";
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
  const [isCompleted, setIsCompleted] = useState(false);

  // Check if this form was already submitted successfully
  useEffect(() => {
    // Generate a unique form submission ID based on the checklist or a session ID
    const formSubmissionKey = `inspection_submitted_${inspectionId || window.location.pathname}`;
    
    // Check if we've already submitted this form in this session
    if (sessionStorage.getItem(formSubmissionKey) === "true") {
      console.log("Form was already submitted successfully in this session");
      setIsCompleted(true);
      
      // If we have an inspection ID, we can navigate directly
      if (inspectionId) {
        console.log(`Redirecting to already created inspection: ${inspectionId}`);
        navigate(`/inspections/${inspectionId}/view`, { replace: true });
      }
    }
  }, [inspectionId, navigate]);

  const handleStartInspection = async (formData: any) => {
    // Prevent submission if already submitted or in progress
    if (isSubmitting || isCompleted) {
      console.log("Preventing duplicate submission - already submitted or in progress");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create inspection in backend
      const result = await window.startInspection?.(formData);
      
      if (result && result.success && result.inspectionId) {
        // Mark this form as successfully submitted
        const formSubmissionKey = `inspection_submitted_${inspectionId || window.location.pathname}`;
        sessionStorage.setItem(formSubmissionKey, "true");
        sessionStorage.setItem("last_created_inspection_id", result.inspectionId);
        
        console.log(`Inspection created successfully, redirecting to: ${result.inspectionId}`);
        setIsCompleted(true);
        
        // Use replace to prevent back button from returning to form
        navigate(`/inspections/${result.inspectionId}/view`, { replace: true });
      }
    } catch (error) {
      console.error("Error starting inspection:", error);
      setIsSubmitting(false);
    }
  };

  // If we already completed this form, show a disabled state
  if (isCompleted) {
    return (
      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-6">
        <Button variant="outline" onClick={cancelAndGoBack} type="button">
          Voltar
        </Button>
        <Button disabled type="button">
          Inspeção já iniciada
        </Button>
      </div>
    );
  }

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
