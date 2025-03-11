
import { useState, useEffect } from "react";
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
  const { user, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState("manual");
  const [tokenRefreshed, setTokenRefreshed] = useState(false);
  
  // Check and refresh JWT token on component mount
  useEffect(() => {
    const refreshToken = async () => {
      try {
        await refreshSession();
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Failed to refresh token:", error);
          toast.error("Erro ao atualizar sua sessão");
          return false;
        } else if (data?.session) {
          console.log("Session token refreshed successfully");
          setTokenRefreshed(true);
          
          // Log session details for debugging
          console.log("Session details:", {
            expiresAt: data.session.expires_at,
            expiryFormatted: data.session.expires_at 
              ? new Date(data.session.expires_at * 1000).toLocaleString() 
              : 'unknown',
            userId: data.session.user?.id,
            tokenLength: data.session.access_token.length
          });
          
          return true;
        } else {
          console.warn("No active session found");
          toast.error("Você não está autenticado");
          navigate("/auth");
          return false;
        }
      } catch (err) {
        console.error("Token refresh error:", err);
        return false;
      }
    };
    
    refreshToken();
    
    // Setup a timer to refresh the token every 10 minutes
    const intervalId = setInterval(() => {
      console.log("Refreshing token (scheduled)");
      refreshToken();
    }, 10 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refreshSession, navigate]);
  
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
        user_id: form.user_id,
        user_tier: user?.tier,
        user_role: user?.role,
        fileIncluded: !!file,
        aiPromptLength: aiPrompt?.length || 0
      });
      
      const success = await handleSubmit(e, activeTab, form, questions, file, aiPrompt);
      
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
    tokenRefreshed
  };
}
