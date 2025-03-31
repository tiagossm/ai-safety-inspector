
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, PlayCircle } from "lucide-react";

interface ChecklistEditActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onStartInspection?: () => void;
}

export function ChecklistEditActions({ 
  isSubmitting, 
  onCancel,
  onStartInspection
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
      
      <Button 
        type="submit"
        disabled={isSubmitting}
        className="flex items-center"
      >
        <Save className="mr-2 h-4 w-4" />
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
      
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
