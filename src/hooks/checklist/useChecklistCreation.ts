
import { useState, useCallback, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useChecklistFormSubmit } from "./form/useChecklistFormSubmit";
import { useChecklistAI } from "../new-checklist/useChecklistAI";
import { useChecklistImport } from "./form/useChecklistImport";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { NewChecklist } from "@/types/checklist";
import { CompanyListItem } from "@/types/CompanyListItem";

export function useChecklistCreation() {
  // Form state
  const [form, setForm] = useState<NewChecklist>({
    title: "",
  });
  
  // Tab state
  const [activeTab, setActiveTab] = useState("manual");
  
  // Manual questions
  const [questions, setQuestions] = useState<any[]>([]);
  
  // File import state
  const [file, setFile] = useState<File | null>(null);
  
  // AI generation state
  const {
    prompt: aiPrompt,
    setPrompt: setAiPrompt,
    questionCount: numQuestions,
    setQuestionCount: setNumQuestions,
    isGenerating: aiLoading,
    selectedAssistant,
    setSelectedAssistant,
    openAIAssistant,
    setOpenAIAssistant,
    assistants,
    loadingAssistants,
    generateChecklist
  } = useChecklistAI();
  
  // Import functionality
  const { importFromFile } = useChecklistImport();
  
  // Form submission
  const { isSubmitting, handleFormSubmit } = useChecklistFormSubmit();
  
  // Navigation
  const navigate = useNavigate();
  
  // Fetch users for assignment
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("status", "active")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch companies
  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, fantasy_name, cnpj")
        .eq("status", "active")
        .order("fantasy_name", { ascending: true });
      
      if (error) throw error;
      return (data || []) as CompanyListItem[];
    }
  });
  
  // Handle adding a question
  const handleAddQuestion = useCallback(() => {
    setQuestions((prev) => [
      ...prev,
      {
        text: "",
        type: "yes_no",
        required: true,
        allowPhoto: false,
        allowVideo: false,
        allowAudio: false
      }
    ]);
  }, []);
  
  // Handle removing a question
  const handleRemoveQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }, []);
  
  // Handle changing a question
  const handleQuestionChange = useCallback(
    (index: number, field: string, value: any) => {
      setQuestions((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [field]: value
        };
        return updated;
      });
    },
    []
  );
  
  // Handle file selection for import
  const handleFileChange = useCallback((selectedFile: File) => {
    setFile(selectedFile);
  }, []);
  
  // Clear selected file
  const clearFile = useCallback(() => {
    setFile(null);
  }, []);
  
  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (activeTab === "manual") {
        // Manual submission
        const success = await handleFormSubmit(
          e,
          activeTab,
          form,
          questions,
          null,
          "",
          async () => ({ success: false })
        );
        
        if (success) {
          navigate("/checklists");
          return true;
        }
      } else if (activeTab === "import") {
        // Import submission
        if (!file) {
          return false;
        }
        
        const result = await importFromFile(file, form);
        
        if (result && result.success) {
          // Navigate to review page or directly create
          navigate("/checklist-editor", {
            state: {
              checklistData: result.checklistData,
              questions: result.questions,
              groups: result.groups,
              mode: result.mode
            }
          });
          return true;
        }
      } else if (activeTab === "ai") {
        // AI generation
        if (!aiPrompt) {
          return false;
        }
        
        const result = await generateChecklist({
          ...form,
          status: "active", // Ensure proper status value for database constraint
        });
        
        if (result.success && result.checklistData && result.questions) {
          // Navigate to review page
          navigate("/checklist-editor", {
            state: {
              checklistData: result.checklistData,
              questions: result.questions,
              groups: result.groups,
              mode: "ai-review"
            }
          });
          return true;
        }
      }
      
      return false;
    },
    [
      activeTab,
      form,
      questions,
      file,
      aiPrompt,
      handleFormSubmit,
      navigate,
      importFromFile,
      generateChecklist
    ]
  );
  
  return {
    activeTab,
    setActiveTab,
    form,
    setForm,
    users,
    loadingUsers,
    companies,
    loadingCompanies,
    isSubmitting,
    file,
    handleFileChange,
    clearFile,
    aiPrompt,
    setAiPrompt,
    numQuestions,
    setNumQuestions,
    aiLoading,
    selectedAssistant,
    setSelectedAssistant,
    openAIAssistant,
    setOpenAIAssistant,
    assistants,
    loadingAssistants,
    questions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionChange,
    handleSubmit,
    navigate
  };
}
