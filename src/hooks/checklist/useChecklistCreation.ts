
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChecklistForm } from "./form/useChecklistForm";
import { useChecklistQuestions } from "./form/useChecklistQuestions";
import { useChecklistFileUpload } from "./form/useChecklistFileUpload";
import { useChecklistAI } from "./form/useChecklistAI";
import { useChecklistUsers } from "./form/useChecklistUsers";
import { useChecklistSubmit } from "./form/useChecklistSubmit";
import { useAuth } from "@/components/AuthProvider";

export function useChecklistCreation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("manual");
  
  // Import all our smaller hooks
  const { form, setForm } = useChecklistForm();
  const { questions, handleAddQuestion, handleRemoveQuestion, handleQuestionChange } = useChecklistQuestions();
  const { file, handleFileChange } = useChecklistFileUpload();
  const { aiPrompt, setAiPrompt, numQuestions, setNumQuestions, aiLoading } = useChecklistAI();
  const { users, loadingUsers } = useChecklistUsers();
  const { isSubmitting, handleSubmit } = useChecklistSubmit();

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e, activeTab, form, questions, file, aiPrompt);
    if (success) {
      navigate("/checklists");
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
    navigate
  };
}
