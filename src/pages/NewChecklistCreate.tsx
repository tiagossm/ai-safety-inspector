import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Bot, Plus, ArrowLeft, Sparkles, Copy } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { createDefaultQuestion } from "@/utils/typeConsistency";
import { QuestionEditor } from "@/components/new-checklist/edit/QuestionEditor";
import { AIChecklistCreator } from "@/components/checklists/create-forms/AIChecklistCreator";
import { CSVImportSection } from "@/components/checklists/create-forms/CSVImportSection";
import { useChecklistCreate } from "@/hooks/new-checklist/useChecklistCreate";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CompanySelector } from "@/components/inspection/CompanySelector";

export default function NewChecklistCreate() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"manual" | "ai" | "upload" | "paste">("manual");
  
  const {
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    isTemplate,
    setIsTemplate,
    questions,
    setQuestions,
    isSubmitting,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleSave
  } = useChecklistCreate();

  // AI related state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");

  // Bulk paste state
  const [bulkText, setBulkText] = useState("");

  // File upload state
  const [uploadedQuestions, setUploadedQuestions] = useState<ChecklistQuestion[]>([]);

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

    setQuestions(prev => [...prev, ...newQuestions]);
    setBulkText("");
    toast.success(`${newQuestions.length} perguntas adicionadas do texto colado`);
  };

  const handleCSVImport = (data: any[]) => {
    const newQuestions: ChecklistQuestion[] = data.map((row, index) => ({
      id: `csv-${Date.now()}-${index}`,
      text: row.pergunta || row.question || row.text || "",
      responseType: mapImportedResponseType(row.tipo_resposta || row.response_type || row.type || "sim/não"),
      isRequired: parseBoolean(row.obrigatorio || row.required || true),
      order: questions.length + index,
      weight: parseInt(row.weight || row.peso || "1"),
      allowsPhoto: parseBoolean(row.permite_foto || row.allows_photo || false),
      allowsVideo: parseBoolean(row.permite_video || row.allows_video || false),
      allowsAudio: parseBoolean(row.permite_audio || row.allows_audio || false),
      allowsFiles: parseBoolean(row.permite_files || row.allows_files || false),
      options: row.opcoes || row.options ? (row.opcoes || row.options).split('|') : undefined,
      hint: row.hint || row.dica || ""
    }));

    setQuestions(prev => [...prev, ...newQuestions]);
    setUploadedQuestions(newQuestions);
    toast.success(`${newQuestions.length} perguntas importadas com sucesso`);
  };

  const mapImportedResponseType = (type: string): ChecklistQuestion["responseType"] => {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes("sim") || normalizedType.includes("yes") || normalizedType.includes("boolean")) return "sim/não";
    if (normalizedType.includes("multiple") || normalizedType.includes("multipla") || normalizedType.includes("choice")) return "seleção múltipla";
    if (normalizedType.includes("numeric") || normalizedType.includes("numero")) return "numérico";
    if (normalizedType.includes("photo") || normalizedType.includes("foto")) return "foto";
    if (normalizedType.includes("signature") || normalizedType.includes("assinatura")) return "assinatura";
    if (normalizedType.includes("time") || normalizedType.includes("hora")) return "hora";
    if (normalizedType.includes("date") || normalizedType.includes("data")) return "data";
    return "texto";
  };

  const parseBoolean = (value: any): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      return lower === "true" || lower === "sim" || lower === "yes" || lower === "1";
    }
    return false;
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Por favor, forneça um prompt para gerar o checklist");
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-checklist', {
        body: {
          prompt: aiPrompt,
          checklistData: {
            title: title || "Checklist Gerado por IA",
            description: description,
            category: category,
            company_id: companyId || null
          },
          questionCount: 10
        }
      });

      if (error) throw error;

      if (data?.questions && Array.isArray(data.questions)) {
        const aiQuestions: ChecklistQuestion[] = data.questions.map((q: any, index: number) => ({
          id: `ai-${Date.now()}-${index}`,
          text: q.text,
          responseType: q.responseType || "sim/não",
          isRequired: q.isRequired !== false,
          order: questions.length + index,
          weight: q.weight || 1,
          allowsPhoto: q.allowsPhoto || false,
          allowsVideo: q.allowsVideo || false,
          allowsAudio: q.allowsAudio || false,
          allowsFiles: q.allowsFiles || false,
          options: q.options || undefined,
          hint: q.hint || ""
        }));

        setQuestions(prev => [...prev, ...aiQuestions]);
        toast.success(`${aiQuestions.length} perguntas geradas pela IA`);
        
        if (data.checklistData?.title) setTitle(data.checklistData.title);
        if (data.checklistData?.description) setDescription(data.checklistData.description);
      }
    } catch (error) {
      console.error("Erro na geração por IA:", error);
      toast.error("Erro ao gerar checklist com IA");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/new-checklists")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Criar Novo Checklist</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do checklist"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Segurança, Qualidade, Manutenção"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste checklist"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Empresa</Label>
              <CompanySelector
                value={companyId}
                onSelect={setCompanyId}
              />
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <Switch
                id="is-template"
                checked={isTemplate}
                onCheckedChange={setIsTemplate}
              />
              <Label htmlFor="is-template">É um template?</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métodos de Criação de Perguntas</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                IA
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Colar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Criação Manual</h3>
                <Button onClick={() => handleAddQuestion("")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Pergunta
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Adicione perguntas uma por uma com controle total sobre cada configuração.
              </p>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <h3 className="text-lg font-medium">Geração por IA</h3>
              <p className="text-sm text-muted-foreground">
                Descreva o que você precisa e a IA gerará perguntas automaticamente.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ai-prompt">Prompt para IA</Label>
                  <Textarea
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Criar um checklist de segurança para soldadores em ambiente industrial..."
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleAIGenerate} 
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full"
                >
                  {aiLoading ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      Gerar Perguntas com IA
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <h3 className="text-lg font-medium">Upload de Arquivo</h3>
              <p className="text-sm text-muted-foreground">
                Importe perguntas de arquivos CSV, XLSX ou TXT.
              </p>
              <CSVImportSection 
                onDataParsed={handleCSVImport}
              />
            </TabsContent>

            <TabsContent value="paste" className="space-y-4">
              <h3 className="text-lg font-medium">Colar Lista de Perguntas</h3>
              <p className="text-sm text-muted-foreground">
                Cole uma lista de perguntas (uma por linha) e elas serão convertidas automaticamente.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulk-text">Cole suas perguntas aqui</Label>
                  <Textarea
                    id="bulk-text"
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="O equipamento está limpo?&#10;As ferramentas estão organizadas?&#10;O local está seguro?"
                    rows={8}
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Perguntas ({questions.length})
              <Button 
                onClick={() => handleAddQuestion("")}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question) => (
              <QuestionEditor
                key={question.id}
                question={question}
                onUpdate={handleUpdateQuestion}
                onDelete={handleDeleteQuestion}
                enableAllMedia={false}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => navigate("/new-checklists")}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSubmitting || !title.trim() || questions.length === 0}
        >
          {isSubmitting ? "Salvando..." : "Salvar Checklist"}
        </Button>
      </div>
    </div>
  );
}
