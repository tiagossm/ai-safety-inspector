
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, MessageCircle, HelpCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { CSVChatBot } from "./CSVChatBot";
import { CSVDocumentation } from "./CSVDocumentation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CSVImportProps {
  onDataParsed?: (data: any[]) => void;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextImport?: (text: string) => void;
}

export function CSVImportSection({ 
  onDataParsed, 
  onFileChange, 
  onTextImport
}: CSVImportProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste" | "help">("upload");
  const [csvText, setCsvText] = useState<string>("");
  const [showChatBot, setShowChatBot] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);

  const exampleCSV = `pergunta,tipo_resposta,obrigatorio,opcoes
"Equipamento funcionando?",sim/não,true,
"Nível de qualidade",seleção múltipla,true,"Excelente|Bom|Regular|Ruim"
"Temperatura",numérico,true,
"Observações",texto,false,
"Registro fotográfico",foto,false,
"Horário da verificação",time,false,
"Data da inspeção",date,false,
"Assinatura do responsável",assinatura,true,`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 5MB permitido.");
        return;
      }
      
      const validTypes = ['text/csv', 'application/csv', 'text/plain'];
      const validExtensions = ['.csv', '.txt'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
        toast.error("Formato de arquivo inválido. Use apenas arquivos CSV ou TXT.");
        return;
      }
      
      if (onFileChange) {
        onFileChange(e);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
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
      
      handleFileChange(event);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTextImport = () => {
    if (!csvText.trim()) {
      toast.error("Por favor, cole o conteúdo CSV");
      return;
    }
    
    if (onTextImport) {
      onTextImport(csvText);
      setCsvText(""); // Limpa o campo após o import
    }
  };

  const handleDownloadExample = () => {
    const blob = new Blob([exampleCSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'exemplo-checklist.csv';
    link.click();
    toast.success("Exemplo baixado!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Importar Perguntas</h3>
          <p className="text-sm text-muted-foreground">
            Carregue um arquivo CSV ou cole o conteúdo diretamente
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showChatBot} onOpenChange={setShowChatBot}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Assistente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Assistente para Criação de CSV</DialogTitle>
              </DialogHeader>
              <div className="h-[60vh]">
                <CSVChatBot />
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showDocumentation} onOpenChange={setShowDocumentation}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Documentação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Documentação e Exemplos CSV</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                <CSVDocumentation />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "paste" | "help")}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload Arquivo</span>
          </TabsTrigger>
          <TabsTrigger value="paste" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Colar Texto</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>Ajuda</span>
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
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              
              <div>
                <p className="font-medium">Arraste e solte seu arquivo CSV aqui</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ou clique para escolher um arquivo
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Formatos aceitos: CSV, TXT (máximo 5MB)
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="paste">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-text">Cole o conteúdo do CSV abaixo</Label>
              <Textarea
                id="csv-text"
                placeholder="pergunta,tipo_resposta,obrigatorio,opcoes&#10;Exemplo de pergunta?,sim/não,true,&#10;Outra pergunta?,seleção múltipla,true,Opção 1|Opção 2|Opção 3"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            
            <Button
              onClick={handleTextImport}
              disabled={!csvText.trim()}
              className="w-full"
            >
              Importar do Texto
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="help">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-800 mb-2">Precisa de ajuda?</h4>
              <p className="text-sm text-blue-700 mb-3">
                Use nosso assistente inteligente ou consulte a documentação completa para criar CSVs perfeitos.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setShowChatBot(true)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Abrir Assistente
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowDocumentation(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Documentação
                </Button>
              </div>
            </div>

            <div className="bg-muted rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Exemplo Completo</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadExample}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              </div>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                {exampleCSV}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">✅ Formatos Suportados</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• sim/não - Resposta binária</li>
                  <li>• texto - Texto livre</li>
                  <li>• seleção múltipla - Lista de opções</li>
                  <li>• numérico - Valores numéricos</li>
                  <li>• foto - Captura de imagem</li>
                  <li>• assinatura - Assinatura digital</li>
                  <li>• time - Horário</li>
                  <li>• date - Data</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">⚠️ Dicas Importantes</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use aspas para texto com vírgulas</li>
                  <li>• Separe opções com "|"</li>
                  <li>• Use "true" ou "false" para obrigatório</li>
                  <li>• Mantenha os nomes das colunas exatos</li>
                  <li>• Teste com poucas linhas primeiro</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
