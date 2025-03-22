
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

interface CSVImportProps {
  onDataParsed: (data: any[]) => void;
  file?: File | null;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextImport?: (text: string) => void;
  clearFile?: () => void;
  getTemplateFileUrl?: () => string;
}

export function CSVImportSection({ 
  onDataParsed, 
  file, 
  onFileChange, 
  onTextImport,
  clearFile,
  getTemplateFileUrl 
}: CSVImportProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>("");
  const [isParsing, setIsParsing] = useState(false);

  // If file is provided externally, use it, otherwise use internal state
  const currentFile = file !== undefined ? file : internalFile;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      if (onFileChange) {
        onFileChange(e);
      } else {
        setInternalFile(selectedFile);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (onFileChange) {
        // Create a synthetic event to pass to onFileChange
        const input = document.createElement('input');
        input.type = 'file';
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        input.files = dataTransfer.files;
        
        const event = {
          target: input,
          currentTarget: input,
          preventDefault: () => {}
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        
        onFileChange(event);
      } else {
        setInternalFile(droppedFile);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClearFile = () => {
    if (clearFile) {
      clearFile();
    } else {
      setInternalFile(null);
    }
  };

  const parseCSV = async (source: "file" | "text") => {
    setIsParsing(true);

    try {
      if (source === "file" && currentFile) {
        Papa.parse(currentFile, {
          header: true,
          complete: (results) => {
            handleParseComplete(results.data);
          },
          error: (error) => {
            toast.error(`Erro ao processar arquivo: ${error.message}`);
            setIsParsing(false);
          }
        });
      } else if (source === "text" && csvText.trim()) {
        // If onTextImport is provided, call it
        if (onTextImport && source === "text") {
          onTextImport(csvText);
          setIsParsing(false);
          return;
        }
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            handleParseComplete(results.data);
          },
          error: (error) => {
            toast.error(`Erro ao processar texto: ${error.message}`);
            setIsParsing(false);
          }
        });
      } else {
        toast.error(source === "file" ? "Nenhum arquivo selecionado" : "Texto vazio");
        setIsParsing(false);
      }
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Erro ao processar dados");
      setIsParsing(false);
    }
  };

  const handleParseComplete = (data: any[]) => {
    // Filter out empty rows
    const validData = data.filter(row => {
      // Check if all values in the row are empty
      const values = Object.values(row);
      return values.some(value => value !== "" && value !== undefined && value !== null);
    });

    if (validData.length === 0) {
      toast.error("Nenhum dado válido encontrado");
      setIsParsing(false);
      return;
    }

    onDataParsed(validData);
    toast.success(`${validData.length} perguntas importadas com sucesso`);
    setIsParsing(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "paste")}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload de arquivo</span>
          </TabsTrigger>
          <TabsTrigger value="paste" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Colar texto</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".csv,.tsv,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              
              {currentFile ? (
                <div>
                  <p className="font-medium">{currentFile.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(currentFile.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearFile();
                    }}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Arraste e solte seu arquivo aqui</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou clique para escolher um arquivo
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Formatos aceitos: CSV, TSV, TXT
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-muted rounded-md p-4">
              <h3 className="font-medium mb-2">Formato esperado</h3>
              <p className="text-sm text-muted-foreground">
                O arquivo deve conter cabeçalhos na primeira linha com: pergunta, tipo_resposta, obrigatorio, opcoes (opcional)
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Tipos de resposta aceitos: sim/não, múltipla escolha, texto, numérico, foto, assinatura
              </p>
              {getTemplateFileUrl && (
                <Button
                  variant="link"
                  className="px-0 text-sm h-auto mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(getTemplateFileUrl(), '_blank');
                  }}
                >
                  Baixar modelo de planilha
                </Button>
              )}
            </div>
            
            <Button
              onClick={() => parseCSV("file")}
              disabled={!currentFile || isParsing}
              className="w-full"
            >
              {isParsing ? "Processando..." : "Importar perguntas"}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="paste">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-text">Cole o conteúdo do CSV abaixo</Label>
              <Textarea
                id="csv-text"
                placeholder="pergunta,tipo_resposta,obrigatorio,opcoes&#10;Exemplo de pergunta?,sim/não,true,&#10;Outra pergunta?,múltipla escolha,true,Opção 1|Opção 2|Opção 3"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            
            <div className="bg-muted rounded-md p-4">
              <h3 className="font-medium mb-2">Formato esperado</h3>
              <p className="text-sm text-muted-foreground">
                Digite ou cole os dados no formato CSV com cabeçalhos. Cada linha deve representar uma pergunta.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Exemplo:
              </p>
              <pre className="text-xs bg-muted-foreground/10 p-2 rounded mt-1 overflow-x-auto">
                pergunta,tipo_resposta,obrigatorio,opcoes<br/>
                Equipamento está limpo?,sim/não,true,<br/>
                Qual o nível de risco?,múltipla escolha,true,Baixo|Médio|Alto
              </pre>
            </div>
            
            <Button
              onClick={() => parseCSV("text")}
              disabled={!csvText.trim() || isParsing}
              className="w-full"
            >
              {isParsing ? "Processando..." : "Importar perguntas"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
