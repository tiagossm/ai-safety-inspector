
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/checklists/create-forms/FormActions";
import { AIChecklistCreator } from "@/components/checklists/create-forms/AIChecklistCreator";
import { ManualCreateForm } from "@/components/checklists/create-forms/ManualCreateForm";
import { ImportCreateForm } from "@/components/checklists/create-forms/ImportCreateForm";
import { useChecklistCreation } from "@/hooks/checklist/useChecklistCreation";

export default function CreateChecklist() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("ai");
  
  // Use the hook for checklist creation logic
  const {
    form,
    setForm,
    users,
    isSubmitting,
    loadingUsers,
    file,
    handleFileChange,
    clearFile,
    questions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionChange,
    handleSubmit,
    companies,
    loadingCompanies,
    aiPrompt,
    setAiPrompt,
    numQuestions,
    setNumQuestions,
    openAIAssistant,
    setOpenAIAssistant
  } = useChecklistCreation();

  // Create wrapper functions that adapt to different component expectations
  // ManualCreateForm and ImportCreateForm expect Promise<boolean>
  const handleSubmitForManualAndImport = async (e: React.FormEvent): Promise<boolean> => {
    const result = await handleSubmit(e, activeTab);
    return result; // Return the boolean result directly
  };
  
  // AIChecklistCreator expects Promise<void>
  const handleSubmitForAI = async (e: React.FormEvent): Promise<void> => {
    await handleSubmit(e, "ai");
    // No return value needed as the component expects void
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate("/checklists")} />
          <h1 className="text-2xl font-bold">Criar Novo Checklist</h1>
        </div>
      </div>

      {/* Quick navigation buttons at the top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card 
          className={`p-4 cursor-pointer hover:border-gray-400 transition-all ${activeTab === "manual" ? "bg-gray-50" : "bg-white"}`}
          onClick={() => setActiveTab("manual")}
        >
          <div className="flex items-center justify-center flex-col text-center gap-2 py-2">
            <FileText className="h-6 w-6 text-gray-700" />
            <span className="font-medium">Criação Manual</span>
          </div>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer hover:border-gray-400 transition-all ${activeTab === "ai" ? "bg-gray-50" : "bg-white"}`}
          onClick={() => setActiveTab("ai")}
        >
          <div className="flex items-center justify-center flex-col text-center gap-2 py-2">
            <Bot className="h-6 w-6 text-gray-700" />
            <span className="font-medium">Gerado por IA</span>
          </div>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer hover:border-gray-400 transition-all ${activeTab === "import" ? "bg-gray-50" : "bg-white"}`}
          onClick={() => setActiveTab("import")}
        >
          <div className="flex items-center justify-center flex-col text-center gap-2 py-2">
            <Upload className="h-6 w-6 text-gray-700" />
            <span className="font-medium">Importar Planilha</span>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="manual">Criação Manual</TabsTrigger>
            <TabsTrigger value="ai">Gerado por IA</TabsTrigger>
            <TabsTrigger value="import">Importar Planilha</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="py-4">
            <ManualCreateForm 
              form={form}
              setForm={setForm}
              users={users}
              loadingUsers={loadingUsers}
              questions={questions}
              onAddQuestion={handleAddQuestion}
              onRemoveQuestion={handleRemoveQuestion}
              onQuestionChange={handleQuestionChange}
              companies={companies}
              loadingCompanies={loadingCompanies}
              onSubmit={handleSubmitForManualAndImport}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
          
          <TabsContent value="ai" className="py-4">
            <AIChecklistCreator 
              form={form}
              setForm={setForm}
              onSubmit={handleSubmitForAI}
              isSubmitting={isSubmitting}
              companies={companies}
              loadingCompanies={loadingCompanies}
              aiPrompt={aiPrompt}
              setAiPrompt={setAiPrompt}
              numQuestions={numQuestions}
              setNumQuestions={setNumQuestions}
              openAIAssistant={openAIAssistant}
              setOpenAIAssistant={setOpenAIAssistant}
            />
          </TabsContent>
          
          <TabsContent value="import" className="py-4">
            <ImportCreateForm 
              form={form}
              setForm={setForm}
              companies={companies}
              loadingCompanies={loadingCompanies}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
