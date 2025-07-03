
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, Download, Copy } from "lucide-react";
import { useCSVImport } from "@/hooks/checklist/form/useCSVImport";
import { CSVImportSection } from "@/components/checklists/create-forms/CSVImportSection";
import { CSVChatBot } from "@/components/checklists/create-forms/CSVChatBot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface CSVImportModalProps {
  onImportQuestions: (questions: any[]) => void;
  children: React.ReactNode;
}

export function CSVImportModal({ onImportQuestions, children }: CSVImportModalProps) {
  const [open, setOpen] = useState(false);
  
  const { 
    processedQuestions,
    isProcessing, 
    validationErrors,
    handleFileImport, 
    handleTextImport, 
    hasImportedQuestions,
    hasValidationErrors,
    getQuestionPreview,
    getValidationSummary,
    clearImportedData,
    transformQuestionsForSubmit
  } = useCSVImport();

  const handleImport = () => {
    if (!hasImportedQuestions || hasValidationErrors) {
      toast.error("Não há perguntas válidas para importar");
      return;
    }

    const questionsToImport = transformQuestionsForSubmit();
    onImportQuestions(questionsToImport);
    setOpen(false);
    clearImportedData();
    toast.success(`${questionsToImport.length} perguntas importadas com sucesso!`);
  };

  const validationSummary = getValidationSummary();
  const questionPreview = getQuestionPreview(3);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Importar Perguntas do CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Importar CSV</TabsTrigger>
              <TabsTrigger value="assistant">Assistente CSV</TabsTrigger>
            </TabsList>
            
            <TabsContent value="import" className="space-y-4">
              <CSVImportSection
                onDataParsed={() => {}}
                onTextImport={handleTextImport}
                onFileChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileImport(e.target.files[0]);
                  }
                }}
              />

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-blue-600 py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium">Processando dados CSV...</span>
                </div>
              )}

              {hasValidationErrors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-sm text-red-700 font-medium mb-2">
                    {validationErrors.length} erro(s) encontrado(s):
                  </div>
                  <ul className="text-sm text-red-600 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearImportedData}
                    className="mt-3"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              )}

              {hasImportedQuestions && !hasValidationErrors && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-green-800">
                      ✅ {validationSummary.totalQuestions} perguntas prontas para importar
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{validationSummary.requiredQuestions} obrigatórias</Badge>
                      <Badge variant="outline">{validationSummary.optionalQuestions} opcionais</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-green-700">Preview das primeiras perguntas:</h4>
                    {questionPreview.map((question, index) => (
                      <div key={index} className="text-sm bg-white p-2 rounded border">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">#{question.ordem}</Badge>
                          <span className="font-medium">{question.pergunta}</span>
                          <Badge variant="outline" className="text-xs">{question.tipo_resposta}</Badge>
                          {question.obrigatorio && <Badge variant="destructive" className="text-xs">obrigatória</Badge>}
                        </div>
                      </div>
                    ))}
                    {validationSummary.totalQuestions > 3 && (
                      <p className="text-xs text-green-600 italic">
                        ... e mais {validationSummary.totalQuestions - 3} perguntas
                      </p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="assistant" className="h-[500px]">
              <CSVChatBot />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!hasImportedQuestions || hasValidationErrors}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar {hasImportedQuestions ? validationSummary.totalQuestions : 0} Perguntas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
