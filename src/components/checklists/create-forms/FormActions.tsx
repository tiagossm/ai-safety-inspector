
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
  submitText = "Criar Lista de Verificação"
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-4">
      <Button 
        variant="outline" 
        type="button" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button 
        type="submit"
        disabled={isSubmitting || !canSubmit}
      >
        {isSubmitting ? "Criando..." : submitText}
      </Button>
    </div>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Voltar
    </Button>
  );
}
