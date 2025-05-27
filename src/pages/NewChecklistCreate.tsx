
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, FileText, Bot, Upload, Copy, Eye, Save } from "lucide-react";
import { ChecklistQuestion } from "@/types/newChecklist";
import { createDefaultQuestion } from "@/utils/typeConsistency";
import { QuestionEditor } from "@/components/new-checklist/edit/QuestionEditor";
import { useChecklistCreate } from "@/hooks/new-checklist/useChecklistCreate";
import { toast } from "sonner";
import { CompanySelector } from "@/components/inspection/CompanySelector";
import { CreateChecklistFields } from "@/components/new-checklist/create/CreateChecklistFields";
import { ManualModeContent } from "@/components/new-checklist/create/ManualModeContent";
import { AIModeContent } from "@/components/new-checklist/create/AIModeContent";
import { ImportModeContent } from "@/components/new-checklist/create/ImportModeContent";
import { QuestionPreview } from "@/components/new-checklist/create/QuestionPreview";

export default function NewChecklistCreate() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"manual" | "ai" | "import">("manual");
  const [showPreview, setShowPreview] = useState(false);
  
  // Campos comuns obrigatórios para todos os fluxos
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState<string>("");
  const [isTemplate, setIsTemplate] = useState(false);
  
  const {
    questions,
    setQuestions,
    isSubmitting,
    handleAddQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleSave
  } = useChecklistCreate();

  // Estados específicos para cada modo
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [contextType, setContextType] = useState("Setor");
  const [contextValue, setContextValue] = useState("");
  
  const [bulkText, setBulkText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Validação de campos obrigatórios
  const isFormValid = () => {
    return title.trim() && category.trim() && description.trim() && companyId;
  };

  const canProceedToSave = () => {
    return isFormValid() && questions.length > 0;
  };

  const handlePreview = () => {
    if (!isFormValid()) {
      toast.error("Preencha todos os campos obrigatórios antes de visualizar");
      return;
    }
    
    if (questions.length === 0) {
      toast.error("Adicione pelo menos uma pergunta antes de visualizar");
      return;
    }
    
    setShowPreview(true);
  };

  const handleSaveChecklist = async () => {
    if (!canProceedToSave()) {
      toast.error("Complete todos os campos obrigatórios e adicione perguntas");
      return;
    }

    const success = await handleSave();
    if (success) {
      navigate("/new-checklists");
    }
  };

  if (showPreview) {
    return (
      <QuestionPreview
        title={title}
        category={category}
        description={description}
        companyId={companyId}
        isTemplate={isTemplate}
        questions={questions}
        onBack={() => setShowPreview(false)}
        onSave={handleSaveChecklist}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/new-checklists")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Criar Novo Checklist</h1>
      </div>

      {/* Navegação por tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Criação Manual
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Gerado por IA
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importar
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {/* Campos obrigatórios comuns a todos os fluxos */}
              <CreateChecklistFields
                title={title}
                setTitle={setTitle}
                category={category}
                setCategory={setCategory}
                description={description}
                setDescription={setDescription}
                companyId={companyId}
                setCompanyId={setCompanyId}
                isTemplate={isTemplate}
                setIsTemplate={setIsTemplate}
              />

              {/* Conteúdo específico de cada modo */}
              <TabsContent value="manual" className="space-y-6 mt-6">
                <ManualModeContent
                  questions={questions}
                  onAddQuestion={handleAddQuestion}
                  onUpdateQuestion={handleUpdateQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                />
              </TabsContent>

              <TabsContent value="ai" className="space-y-6 mt-6">
                <AIModeContent
                  aiPrompt={aiPrompt}
                  setAiPrompt={setAiPrompt}
                  aiLoading={aiLoading}
                  setAiLoading={setAiLoading}
                  selectedAssistant={selectedAssistant}
                  setSelectedAssistant={setSelectedAssistant}
                  numQuestions={numQuestions}
                  setNumQuestions={setNumQuestions}
                  contextType={contextType}
                  setContextType={setContextType}
                  contextValue={contextValue}
                  setContextValue={setContextValue}
                  companyId={companyId}
                  category={category}
                  description={description}
                  questions={questions}
                  setQuestions={setQuestions}
                />
              </TabsContent>

              <TabsContent value="import" className="space-y-6 mt-6">
                <ImportModeContent
                  bulkText={bulkText}
                  setBulkText={setBulkText}
                  uploadedFile={uploadedFile}
                  setUploadedFile={setUploadedFile}
                  questions={questions}
                  setQuestions={setQuestions}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Ações finais */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {questions.length > 0 ? (
            <span className="text-green-600">
              ✓ {questions.length} pergunta{questions.length !== 1 ? 's' : ''} adicionada{questions.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span>Nenhuma pergunta adicionada</span>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/new-checklists")}>
            Cancelar
          </Button>
          
          {questions.length > 0 && (
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!isFormValid()}
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
          )}
          
          <Button
            onClick={handleSaveChecklist}
            disabled={!canProceedToSave() || isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Salvando..." : "Salvar Checklist"}
          </Button>
        </div>
      </div>
    </div>
  );
}
