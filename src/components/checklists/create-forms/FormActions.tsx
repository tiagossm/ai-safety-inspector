
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  canSubmit?: boolean;
  submitText?: string;
  showSubmitButton?: boolean;
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-1"
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Voltar</span>
    </Button>
  );
}

export function FormActions({
  isSubmitting,
  onCancel,
  canSubmit = true,
  submitText = "Salvar",
  showSubmitButton = true
}: FormActionsProps) {
  return (
    <div className="flex justify-between items-center border-t pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>

      {showSubmitButton && (
        <Button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? "Processando..." : submitText}
        </Button>
      )}
    </div>
  );
}
