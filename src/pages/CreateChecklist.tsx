
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
import { NewChecklist as NewChecklistType } from "@/types/newChecklist";

export default function CreateChecklist() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("ai");
  
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
    loadingCompanies
  } = useChecklistCreation();

  const normalizeStatus = (status?: string): "active" | "inactive" => {
    if (status === 'active' || status === 'inactive') {
      return status;
    }
    return 'active';
  };

  const handleSubmitForManualAndImport = async (e: React.FormEvent): Promise<boolean> => {
    // Create a new object with the correct type, explicitly casting status to the required type
    const adaptedForm: NewChecklistType = {
      title: form.title,
      description: form.description,
      is_template: form.is_template,
      status: normalizeStatus(form.status),
      category: form.category,
      responsible_id: form.responsible_id,
      company_id: form.company_id,
      due_date: form.due_date,
      user_id: form.user_id,
      origin: form.origin,
      status_checklist: form.status_checklist
    };
    
    const result = await handleSubmit(e);
    return result;
  };
  
  const handleSubmitForAI = async (e: React.FormEvent): Promise<void> => {
    // Create a new object with the correct type, explicitly casting status to the required type
    const adaptedForm: NewChecklistType = {
      title: form.title,
      description: form.description,
      is_template: form.is_template,
      status: normalizeStatus(form.status),
      category: form.category,
      responsible_id: form.responsible_id,
      company_id: form.company_id,
      due_date: form.due_date,
      user_id: form.user_id,
      origin: form.origin,
      status_checklist: form.status_checklist
    };
    
    await handleSubmit(e);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate("/checklists")} />
          <h1 className="text-2xl font-bold">Criar Novo Checklist</h1>
        </div>
      </div>

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
              onSubmit={handleSubmitForManualAndImport}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
