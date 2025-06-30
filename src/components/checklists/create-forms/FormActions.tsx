
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  canSubmit: boolean;
  submitText?: string;
}

export function FormActions({
  isSubmitting,
  onCancel,
  canSubmit,
  submitText = "Criar Checklist"
}: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      
      <Button
        type="submit"
        disabled={isSubmitting || !canSubmit}
      >
        {isSubmitting ? (
          "Salvando..."
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            {submitText}
          </>
        )}
      </Button>
    </div>
  );
}

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick}>
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
