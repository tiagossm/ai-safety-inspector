
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface ChecklistEditActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ChecklistEditActions({ isSubmitting, onCancel }: ChecklistEditActionsProps) {
  return (
    <div className="flex justify-end gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancelar
      </Button>
      
      <Button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Salvar alterações
          </>
        )}
      </Button>
    </div>
  );
}
