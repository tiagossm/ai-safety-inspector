
import { useEffect } from "react";
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
      try {
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          toast.error("Erro ao verificar sessão. Tente fazer login novamente.");
          return;
        }
        
        if (!data.session) {
          console.warn("No active session found");
          toast.error("Sessão expirada. Faça login novamente.");
          navigate("/auth");
          return;
        }
        
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
        
        // Manually refresh token to ensure it's valid
        await refreshSession();
      } catch (err) {
        console.error("Error in auth check:", err);
      }
    };
    
    checkAuth();
  }, [navigate, refreshSession, user]);

  // Determinar se o botão de envio deve estar habilitado
  const isSubmitEnabled = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton onClick={() => navigate("/checklists")} />
          <h1 className="text-2xl font-bold">Criar Nova Lista de Verificação</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
