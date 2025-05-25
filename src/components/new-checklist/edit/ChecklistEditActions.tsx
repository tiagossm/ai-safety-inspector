
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Play, X } from "lucide-react";

interface ChecklistEditActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onStartInspection: () => void;
  onSave: () => void;
}

export function ChecklistEditActions({
  isSubmitting,
  onCancel,
  onStartInspection,
  onSave
}: ChecklistEditActionsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onStartInspection}
            disabled={isSubmitting}
          >
            <Play className="h-4 w-4 mr-2" />
            Iniciar Inspeção
          </Button>
          
          <Button
            type="submit"
            onClick={onSave}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Salvando..." : "Salvar Checklist"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
