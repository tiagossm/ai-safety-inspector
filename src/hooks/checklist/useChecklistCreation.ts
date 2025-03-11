
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
import { supabase } from "@/integrations/supabase/client";

export function useChecklistCreation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("manual");
  
  // Check and refresh JWT token on component mount
  const refreshToken = async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Failed to refresh token:", error);
    } else if (data?.session) {
      console.log("Session token refreshed successfully");
    } else {
      console.warn("No active session found");
    }
  };
  
  // Call refreshToken once to ensure we have a valid token
  useState(() => {
    refreshToken();
  });
  
  // Import all our smaller hooks
  const { form, setForm } = useChecklistForm();
  const { questions, handleAddQuestion, handleRemoveQuestion, handleQuestionChange } = useChecklistQuestions();
  const { file, handleFileChange, clearFile } = useChecklistFileUpload();
  const { aiPrompt, setAiPrompt, numQuestions, setNumQuestions, aiLoading } = useChecklistAI();
  const { users, loadingUsers } = useChecklistUsers();
  const { isSubmitting, handleSubmit } = useChecklistSubmit();

  const onSubmit = async (e: React.FormEvent) => {
    console.log("Submit handler triggered");
    
    // Refresh token before submission to ensure we have a valid JWT
    await refreshToken();
    
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
      // Ensure user_id is set
      if (!form.user_id && user?.id) {
        form.user_id = user.id;
      }
      
      // Log debugging information
      console.log("Form being submitted:", {
        activeTab,
        title: form.title,
        user_id: form.user_id,
        user_tier: user?.tier,
        user_role: user?.role,
        fileIncluded: !!file,
        aiPromptLength: aiPrompt?.length || 0
      });
      
      const success = await handleSubmit(e, activeTab, form, questions, file, aiPrompt);
      if (success) {
        console.log("Submission successful");
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
