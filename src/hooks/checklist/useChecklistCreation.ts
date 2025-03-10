
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChecklistForm } from "./form/useChecklistForm";
import { useChecklistQuestions } from "./form/useChecklistQuestions";
import { useChecklistFileUpload } from "./form/useChecklistFileUpload";
import { useChecklistAI } from "./form/useChecklistAI";
import { useChecklistUsers } from "./form/useChecklistUsers";
import { useChecklistSubmit } from "./form/useChecklistSubmit";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

export function useChecklistCreation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("manual");
  
  // Import all our smaller hooks
  const { form, setForm } = useChecklistForm();
  const { questions, handleAddQuestion, handleRemoveQuestion, handleQuestionChange } = useChecklistQuestions();
  const { file, handleFileChange, clearFile } = useChecklistFileUpload();
  const { aiPrompt, setAiPrompt, numQuestions, setNumQuestions, aiLoading } = useChecklistAI();
  const { users, loadingUsers } = useChecklistUsers();
  const { isSubmitting, handleSubmit } = useChecklistSubmit();

  const onSubmit = async (e: React.FormEvent) => {
    console.log("Submit handler triggered");
    
    // Form validation based on active tab
    if (activeTab === "manual" && !form.title.trim()) {
      toast.error("O título é obrigatório");
      return;
    } else if (activeTab === "import" && !file) {
      toast.error("Por favor, selecione um arquivo para importar");
      return;
    } else if (activeTab === "ai" && !aiPrompt.trim()) {
      toast.error("Por favor, forneça um prompt para gerar o checklist");
      return;
    }
    
    try {
      const success = await handleSubmit(e, activeTab, form, questions, file, aiPrompt);
      if (success) {
        console.log("Submission successful, navigating to /checklists");
        // Note: Navigation is now handled inside handleSubmit for better control
      } else {
        console.error("Submission failed but no exception thrown");
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error(`Erro ao criar checklist: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
    navigate
  };
}
