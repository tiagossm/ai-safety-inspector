
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, PlayCircle, Save, Bot, FileSpreadsheet, Wand2, Upload } from "lucide-react";
import { AIExpandModal } from "./AIExpandModal";
import { CSVImportModal } from "./CSVImportModal";

interface ChecklistHeaderExpandedProps {
  onBack: () => void;
  onRefresh?: () => void;
  onStartInspection: () => void;
  onSave: () => void;
  onAIExpand: (prompt: string, numQuestions: number) => Promise<void>;
  onCSVImport: (questions: any[]) => void;
  isGeneratingAI?: boolean;
  isSaving?: boolean;
}

export function ChecklistHeaderExpanded({
  onBack,
  onRefresh,
  onStartInspection,
  onSave,
  onAIExpand,
  onCSVImport,
  isGeneratingAI = false,
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
        {/* Botões de expansão */}
        <div className="flex items-center gap-2 mr-4">
          <AIExpandModal onGenerateQuestions={onAIExpand} isGenerating={isGeneratingAI}>
            <Button variant="outline" size="sm" disabled={isGeneratingAI}>
              {isGeneratingAI ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Gerando...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Expandir com IA
                </>
              )}
            </Button>
          </AIExpandModal>

          <CSVImportModal onImportQuestions={onCSVImport}>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Importar CSV
            </Button>
          </CSVImportModal>
        </div>

        {/* Botões de ação */}
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
