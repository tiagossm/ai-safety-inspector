
import { useEffect, useState } from "react";
import { useChecklistCreation } from "@/hooks/checklist/useChecklistCreation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Bot } from "lucide-react";
import { ManualCreateForm } from "@/components/checklists/create-forms/ManualCreateForm";
import { ImportCreateForm } from "@/components/checklists/create-forms/ImportCreateForm";
import { AICreateForm } from "@/components/checklists/create-forms/AICreateForm";
import { BackButton, FormActions } from "@/components/checklists/create-forms/FormActions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

export default function CreateChecklist() {
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
    navigate
  } = useChecklistCreation();
  
  const { user, refreshSession } = useAuth();
  
  // Check auth status and refresh token on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // Explicitly refresh the session
        await refreshSession();
        
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          toast.error("Erro ao verificar sessão. Tente fazer login novamente.");
          setIsSessionValid(false);
          navigate("/auth");
          return;
        }
        
        if (!data.session) {
          console.warn("No active session found");
          toast.error("Sessão expirada. Faça login novamente.");
          setIsSessionValid(false);
          navigate("/auth");
          return;
        }
        
        // Session is valid
        setIsSessionValid(true);
        
        // Log user info for debugging
        console.log("User authentication info:", {
          authenticated: !!data.session,
          userId: user?.id,
          userTier: user?.tier,
          userRole: user?.role,
          tokenExpiry: data.session.expires_at 
            ? new Date(data.session.expires_at * 1000).toLocaleString() 
            : 'unknown'
        });
      } catch (err) {
        console.error("Error in auth check:", err);
        setIsSessionValid(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, refreshSession, user]);

  // Determinar se o botão de envio deve estar habilitado
  const isSubmitEnabled = () => {
    if (!isSessionValid) return false;
    
    switch (activeTab) {
      case "manual":
        return form.title.trim() !== "";
      case "import":
        return file !== null && form.title.trim() !== "";
      case "ai":
        return aiPrompt.trim() !== "" && !aiLoading;
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3">Verificando sessão...</span>
      </div>
    );
  }

  if (!isSessionValid) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-lg">Você precisa estar autenticado para criar uma lista de verificação.</p>
        <button 
          onClick={() => navigate("/auth")} 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Fazer login
        </button>
      </div>
    );
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submit triggered with active tab:", activeTab);
    
    // Check session before submission
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      toast.error("Sua sessão expirou. Por favor, faça login novamente.");
      navigate("/auth");
      return;
    }
    
    // Fix: calling handleSubmit with only one argument (the event)
    const result = await handleSubmit(e);
    console.log("Form submission result:", result);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate("/checklists")} />
          <h1 className="text-2xl font-bold">Criar Nova Lista de Verificação</h1>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
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
            />
          </TabsContent>
        </Tabs>
        
        <FormActions 
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/checklists")}
          canSubmit={isSubmitEnabled()}
          submitText={isSubmitting ? "Criando..." : "Criar Lista de Verificação"}
        />
      </form>
    </div>
  );
}
