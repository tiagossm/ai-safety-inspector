
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, PlayCircle, Save } from "lucide-react";

interface ChecklistHeaderExpandedProps {
  onBack: () => void;
  onRefresh?: () => void;
  onStartInspection: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function ChecklistHeaderExpanded({
  onBack,
  onRefresh,
  onStartInspection,
  onSave,
  isSaving = false
}: ChecklistHeaderExpandedProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Editar Checklist</h1>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="outline"
          onClick={onStartInspection}
          disabled={isSaving}
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Iniciar Inspeção
        </Button>

        <Button
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
