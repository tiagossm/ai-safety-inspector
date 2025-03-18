
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChecklistForm } from "./form/useChecklistForm";
import { useChecklistQuestions } from "./form/useChecklistQuestions";
import { useChecklistFileUpload } from "./form/useChecklistFileUpload";
import { useChecklistAI } from "./form/useChecklistAI";
import { useChecklistUsers } from "./form/useChecklistUsers";
import { useChecklistSubmit } from "./form/useChecklistSubmit";
import { useChecklistAuth } from "./form/useChecklistAuth";
import { useChecklistTabs } from "./form/useChecklistTabs";
import { useChecklistCompanies } from "./form/useChecklistCompanies";
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
  const { isSubmitting, handleSubmit: submitChecklist } = useChecklistSubmit();

  const onSubmit = async (e: React.FormEvent) => {
    console.log("Submit handler triggered");
    
    // Refresh token before submission to ensure we have a valid JWT
    const tokenValid = await refreshSession();
    
    if (!tokenValid) {
      console.error("Failed to refresh token before submission");
      toast.error("Erro de autenticação. Faça login novamente.");
      navigate("/auth");
      return false;
    }
    
    // Form validation based on active tab
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
    
    try {
      // Ensure user_id is set
      if (!form.user_id && user?.id) {
        form.user_id = user.id;
        console.log("Setting user_id in form:", user.id);
      }
      
      // Log debugging information
      console.log("Form being submitted:", {
        activeTab,
        title: form.title,
        company_id: form.company_id,
        user_id: form.user_id,
        user_tier: user?.tier,
        user_role: user?.role,
        fileIncluded: !!file,
        aiPromptLength: aiPrompt?.length || 0
      });
      
      let success = false;
      
      if (activeTab === "ai") {
        // Handle AI-generated checklist
        if (aiPrompt.trim()) {
          try {
            const result = await generateAIChecklist(form);
            console.log("AI generation result:", result);
            success = !!result;
          } catch (err) {
            console.error("Error generating AI checklist:", err);
            toast.error("Erro ao gerar checklist com IA. Tente novamente mais tarde.");
            return false;
          }
        }
      } else {
        success = await submitChecklist(e, activeTab, form, questions, file, aiPrompt);
      }
      
      if (success) {
        console.log("Submission successful");
        return true;
      } else {
        console.error("Submission failed but no exception thrown");
        return false;
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return false;
    }
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
