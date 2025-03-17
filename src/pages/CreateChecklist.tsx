
import { useState } from "react";
import { useChecklistCreation } from "@/hooks/checklist/useChecklistCreation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Bot } from "lucide-react";
import { ManualCreateForm } from "@/components/checklists/create-forms/ManualCreateForm";
import { ImportCreateForm } from "@/components/checklists/create-forms/ImportCreateForm";
import { AICreateForm } from "@/components/checklists/create-forms/AICreateForm";
import { BackButton, FormActions } from "@/components/checklists/create-forms/FormActions";
import { toast } from "sonner";

export default function CreateChecklist() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const {
    activeTab,
    setActiveTab,
    form,
    setForm,
    users,
    isSubmitting,
    loadingUsers,
    file,
    handleFileChange,
    clearFile,
    aiPrompt,
    setAiPrompt,
    numQuestions,
    setNumQuestions,
    aiLoading,
    questions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionChange,
    handleSubmit,
    navigate,
    companies,
    loadingCompanies
  } = useChecklistCreation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    const success = await handleSubmit(e);
    
    if (success) {
      toast.success("Checklist criado com sucesso!");
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate("/checklists")} />
          <h1 className="text-2xl font-bold">Criar Nova Lista de Verificação</h1>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Criação Manual</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Importar Planilha</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>Gerado por IA</span>
            </TabsTrigger>
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
            />
          </TabsContent>
          
          <TabsContent value="import" className="py-4">
            <ImportCreateForm 
              form={form}
              setForm={setForm}
              users={users}
              loadingUsers={loadingUsers}
              file={file}
              onFileChange={handleFileChange}
              companies={companies}
              loadingCompanies={loadingCompanies}
            />
          </TabsContent>
          
          <TabsContent value="ai" className="py-4">
            <AICreateForm 
              form={form}
              setForm={setForm}
              users={users}
              loadingUsers={loadingUsers}
              aiPrompt={aiPrompt}
              setAiPrompt={setAiPrompt}
              numQuestions={numQuestions}
              setNumQuestions={setNumQuestions}
              onGenerateAI={() => {}} // Este é tratado no submit
              aiLoading={aiLoading}
              companies={companies}
              loadingCompanies={loadingCompanies}
            />
          </TabsContent>
        </Tabs>
        
        <FormActions 
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/checklists")}
          canSubmit={!isSubmitting}
          submitText={isSubmitting ? "Criando..." : "Criar Lista de Verificação"}
        />
      </form>
    </div>
  );
}
