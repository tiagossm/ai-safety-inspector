
import { useNavigate } from "react-router-dom";
import { useChecklistForm } from "./form/useChecklistForm";
import { useChecklistQuestions } from "./form/useChecklistQuestions";
import { useChecklistFileUpload } from "./form/useChecklistFileUpload";
import { useChecklistAI } from "./form/useChecklistAI";
import { useChecklistUsers } from "./form/useChecklistUsers";
import { useChecklistAuth } from "./form/useChecklistAuth";
import { useChecklistTabs } from "./form/useChecklistTabs";
import { useChecklistCompanies } from "./form/useChecklistCompanies";
import { useChecklistFormSubmit } from "./form/useChecklistFormSubmit";
import { toast } from "sonner";

export function useChecklistCreation() {
  const navigate = useNavigate();
  
  // Import all our smaller hooks
  const { user, refreshSession, tokenRefreshed } = useChecklistAuth();
  const { activeTab, setActiveTab } = useChecklistTabs();
  const { companies, loadingCompanies } = useChecklistCompanies();
  const { form, setForm } = useChecklistForm();
  const { questions, handleAddQuestion, handleRemoveQuestion, handleQuestionChange } = useChecklistQuestions();
  const { file, handleFileChange, clearFile } = useChecklistFileUpload();
  const { aiPrompt, setAiPrompt, numQuestions, setNumQuestions, aiLoading, generateAIChecklist } = useChecklistAI();
  const { users, loadingUsers } = useChecklistUsers();
  const { isSubmitting, handleFormSubmit } = useChecklistFormSubmit();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation based on active tab
    if (activeTab === "manual" && !form.title.trim()) {
      toast.error("O título é obrigatório");
      return false;
    } else if (activeTab === "import" && !file) {
      toast.error("Por favor, selecione um arquivo para importar");
      return false;
    } else if (activeTab === "ai" && !aiPrompt.trim()) {
      toast.error("Por favor, forneça um prompt para gerar o checklist");
      return false;
    }
    
    const success = await handleFormSubmit(
      e, 
      activeTab, 
      form, 
      questions, 
      file, 
      aiPrompt, 
      generateAIChecklist
    );
    
    if (success) {
      toast.success("Checklist criado com sucesso!");
    }
    
    return success;
  };

  return {
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
    handleSubmit: onSubmit,
    navigate,
    tokenRefreshed,
    companies,
    loadingCompanies
  };
}
