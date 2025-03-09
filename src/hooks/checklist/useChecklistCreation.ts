
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChecklistForm } from "./form/useChecklistForm";
import { useChecklistQuestions } from "./form/useChecklistQuestions";
import { useChecklistFileUpload } from "./form/useChecklistFileUpload";
import { useChecklistAI } from "./form/useChecklistAI";
import { useChecklistUsers } from "./form/useChecklistUsers";
import { useChecklistSubmit } from "./form/useChecklistSubmit";
import { useAuth } from "@/components/AuthProvider";
import { AuthUser } from "@/hooks/auth/useAuthState";

export function useChecklistCreation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const extendedUser = user as AuthUser | null;
  const [activeTab, setActiveTab] = useState("manual");
  
  // Import all our smaller hooks
  const { form, setForm } = useChecklistForm();
  const { questions, handleAddQuestion, handleRemoveQuestion, handleQuestionChange } = useChecklistQuestions();
  const { file, handleFileChange } = useChecklistFileUpload();
  const { aiPrompt, setAiPrompt, numQuestions, setNumQuestions, aiLoading } = useChecklistAI();
  const { users, loadingUsers } = useChecklistUsers();
  const { isSubmitting, handleSubmit } = useChecklistSubmit();

  // Set company_id from the authenticated user if available
  useState(() => {
    if (extendedUser?.company_id) {
      setForm(prevForm => ({
        ...prevForm,
        company_id: extendedUser.company_id
      }));
    }
  });

  const onSubmit = async (e: React.FormEvent) => {
    console.log("Submit handler triggered");
    try {
      // Ensure company_id is set from user context if available
      if (extendedUser?.company_id && !form.company_id) {
        setForm(prevForm => ({
          ...prevForm,
          company_id: extendedUser.company_id
        }));
      }
      
      const success = await handleSubmit(e, activeTab, form, questions, file, aiPrompt);
      if (success) {
        console.log("Submission successful, navigating to /checklists");
        navigate("/checklists");
      } else {
        console.error("Submission failed but no exception thrown");
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
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
    userCompanyId: extendedUser?.company_id
  };
}
