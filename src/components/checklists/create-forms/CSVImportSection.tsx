
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, FileCode, X } from "lucide-react";
import { toast } from "sonner";

interface CSVImportSectionProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextImport?: (text: string) => void;
  clearFile: () => void;
  getTemplateFileUrl: () => string;
}

export function CSVImportSection({
  file,
  onFileChange,
  onTextImport,
  clearFile,
  getTemplateFileUrl
}: CSVImportSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [importTab, setImportTab] = useState<string>("upload");
  const [csvText, setCsvText] = useState<string>("");
  const templateUrl = getTemplateFileUrl();
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fileInput = document.getElementById('file') as HTMLInputElement;
      fileInput.files = e.dataTransfer.files;
      
      // Create a synthetic event to pass to the original handler
      const event = {
        target: fileInput,
        currentTarget: fileInput,
        preventDefault: () => {}
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      onFileChange(event);
    }
  };

  const handleTextImport = () => {
    if (!csvText.trim()) {
      toast.error("Por favor, insira algum texto para importar");
      return;
    }

    if (onTextImport) {
      onTextImport(csvText);
    } else {
      // Fallback: convert text to file and use file handler
      const blob = new Blob([csvText], { type: 'text/csv' });
      const file = new File([blob], 'imported-text.csv', { type: 'text/csv' });
      
      const fileInput = document.getElementById('file') as HTMLInputElement;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      
      const event = {
        target: fileInput,
        currentTarget: fileInput,
        preventDefault: () => {}
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      onFileChange(event);
    }
    
    toast.success("Texto importado com sucesso!");
    setCsvText("");
    setImportTab("upload"); // Switch back to upload tab
  };

  return (
    <Card className="p-4">
      <Tabs value={importTab} onValueChange={setImportTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload de Arquivo</span>
          </TabsTrigger>
          <TabsTrigger value="paste" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            <span>Colar Texto</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">
                Arquivo para Importar <span className="text-red-500">*</span>
              </Label>
              
              <div 
                className={`mt-2 border-2 border-dashed rounded-lg p-6 flex flex-col items-center ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="w-full">
                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={clearFile}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-center font-medium mb-1">
                      Arraste e solte seu arquivo aqui ou
                    </p>
                    <Input
                      id="file"
                      type="file"
                      className="hidden"
                      onChange={onFileChange}
                      accept=".csv,.xls,.xlsx"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('file')?.click()}
                      className="mt-2"
                    >
                      Selecionar arquivo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Formatos suportados: CSV, XLS, XLSX.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="paste" className="mt-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-text">
                Cole o conteúdo da planilha aqui <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="csv-text"
                placeholder="Cole o conteúdo CSV aqui... (ex: Pergunta,Tipo,Obrigatório&#10;Verificar equip. de segurança,sim/não,sim)"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={10}
                className="font-mono text-sm mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Cole o conteúdo do CSV diretamente aqui. A primeira linha deve conter os cabeçalhos.
              </p>
              
              <Button 
                onClick={handleTextImport}
                disabled={!csvText.trim()}
                className="mt-3"
              >
                Importar Texto
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-3 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Não tem um modelo? 
          <a
            href={templateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary ml-1 hover:underline"
          >
            Baixar modelo
          </a>
        </p>
        
        {file && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive/90"
            onClick={clearFile}
          >
            Remover arquivo
          </Button>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="font-medium text-blue-700 mb-1">Dicas para importação</h4>
        <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
          <li>Certifique-se de usar o formato correto (conforme o modelo)</li>
          <li>A primeira linha deve conter os cabeçalhos</li>
          <li>Campos obrigatórios: Pergunta e Tipo</li>
          <li>Para perguntas com múltipla escolha, separe as opções com vírgulas</li>
        </ul>
      </div>
    </Card>
  );
}
