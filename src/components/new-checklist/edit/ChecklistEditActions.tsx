
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, PlayCircle } from "lucide-react";

interface ChecklistEditActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onStartInspection?: () => void;
  onSave?: () => void;
}

export function ChecklistEditActions({ 
  isSubmitting, 
  onCancel,
  onStartInspection,
  onSave
}: ChecklistEditActionsProps) {
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
      
      {onSave && (
        <Button 
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
          className="flex items-center"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Salvando..." : "Salvar Checklist"}
        </Button>
      )}
      
      {onStartInspection && (
        <Button 
          type="button"
          onClick={onStartInspection}
          disabled={isSubmitting}
          className="flex items-center"
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Iniciar Inspeção
        </Button>
      )}
    </div>
  );
}
