
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Copy, FileText, X } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { normalizeResponseType } from "@/utils/typeConsistency";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImportModeContentProps {
  bulkText: string;
  setBulkText: (value: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  questions: ChecklistQuestion[];
  setQuestions: (questions: ChecklistQuestion[]) => void;
}

export function ImportModeContent({
  bulkText,
  setBulkText,
  uploadedFile,
  setUploadedFile,
  questions,
  setQuestions
}: ImportModeContentProps) {
  const handleBulkPaste = () => {
    if (!bulkText.trim()) {
      toast.error("Por favor, cole o texto com as perguntas");
      return;
    }

    const lines = bulkText.split('\n').filter(line => line.trim());
    const newQuestions: ChecklistQuestion[] = lines.map((line, index) => ({
      id: `bulk-${Date.now()}-${index}`,
      text: line.trim(),
      responseType: "sim/não",
      isRequired: true,
      order: questions.length + index,
      weight: 1,
      allowsPhoto: false,
      allowsVideo: false,
      allowsAudio: false,
      allowsFiles: false
    }));

    setQuestions([...questions, ...newQuestions]);
    setBulkText("");
    toast.success(`${newQuestions.length} perguntas adicionadas do texto`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error("Apenas arquivos CSV são suportados");
      return;
    }

    setUploadedFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvContent = event.target?.result as string;
      processCSVContent(csvContent);
    };
    reader.readAsText(file);
  };

  const processCSVContent = (csvContent: string) => {
    try {
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Verificar se tem as colunas necessárias
      if (!headers.includes('pergunta') && !headers.includes('question')) {
        toast.error("CSV deve conter uma coluna 'pergunta' ou 'question'");
        return;
      }

      const newQuestions: ChecklistQuestion[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        const questionText = row.pergunta || row.question || '';
        if (!questionText) continue;

        const responseType = normalizeResponseType(row.tipo_resposta || row.response_type || row.type || "sim/não");
        const isRequired = parseBoolean(row.obrigatorio || row.required || 'true');
        const options = row.opcoes || row.options ? (row.opcoes || row.options).split('|') : undefined;

        newQuestions.push({
          id: `csv-${Date.now()}-${i}`,
          text: questionText,
          responseType,
          isRequired,
          order: questions.length + newQuestions.length,
          weight: parseInt(row.weight || row.peso || "1") || 1,
          allowsPhoto: parseBoolean(row.permite_foto || row.allows_photo || 'false'),
          allowsVideo: parseBoolean(row.permite_video || row.allows_video || 'false'),
          allowsAudio: parseBoolean(row.permite_audio || row.allows_audio || 'false'),
          allowsFiles: parseBoolean(row.permite_files || row.allows_files || 'false'),
          options,
          hint: row.hint || row.dica || ""
        });
      }

      setQuestions([...questions, ...newQuestions]);
      toast.success(`${newQuestions.length} perguntas importadas do CSV`);
    } catch (error) {
      console.error("Erro ao processar CSV:", error);
      toast.error("Erro ao processar arquivo CSV");
    }
  };

  const parseBoolean = (value: string): boolean => {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'sim' || lower === 'yes' || lower === '1';
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload de arquivo
          </TabsTrigger>
          <TabsTrigger value="paste" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Colar texto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Arquivo CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-4">
                    <FileText className="h-12 w-12 text-green-600" />
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button variant="outline" onClick={removeFile}>
                      <X className="h-4 w-4 mr-2" />
                      Remover arquivo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-medium">Arraste e solte seu arquivo aqui</p>
                      <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
                    </div>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="file-upload">Selecionar arquivo CSV</label>
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Formato esperado do CSV</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Cabeçalhos suportados (primeira linha):
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li><strong>pergunta</strong> ou <strong>question</strong> - Texto da pergunta (obrigatório)</li>
                  <li><strong>tipo_resposta</strong> ou <strong>response_type</strong> - sim/não, texto, múltipla escolha, etc.</li>
                  <li><strong>obrigatorio</strong> ou <strong>required</strong> - true/false</li>
                  <li><strong>opcoes</strong> ou <strong>options</strong> - Para múltipla escolha (separadas por |)</li>
                  <li><strong>permite_foto</strong>, <strong>permite_video</strong>, etc. - true/false</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paste" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Colar Lista de Perguntas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bulk-text">
                  Cole suas perguntas aqui (uma por linha)
                </Label>
                <Textarea
                  id="bulk-text"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="O equipamento está limpo?&#10;As ferramentas estão organizadas?&#10;O local está seguro?"
                  rows={10}
                  className="mt-2"
                />
              </div>
              
              <Button 
                onClick={handleBulkPaste} 
                disabled={!bulkText.trim()}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Processar Perguntas
              </Button>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Como usar</h4>
                <p className="text-sm text-muted-foreground">
                  Cole uma lista de perguntas, uma por linha. Todas serão criadas como perguntas de "Sim/Não" obrigatórias. 
                  Você poderá editar os tipos de resposta depois na visualização.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
