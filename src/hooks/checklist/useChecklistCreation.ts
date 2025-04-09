
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChecklistFormSubmit } from "./form/useChecklistFormSubmit";
import { CompanyListItem } from "@/types/CompanyListItem";
import { useChecklistCompanies } from "./form/useChecklistCompanies";
import { NewChecklist as NewChecklistType } from "@/types/newChecklist";

export type AIAssistantType = 'general' | 'workplace-safety' | 'compliance' | 'quality';

export function useChecklistCreation() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("ai");
  const [form, setForm] = useState<NewChecklist>({
    title: "",
    description: "",
    is_template: false,
    status_checklist: "ativo",
    category: "",
    status: "active"
  });
  
  // Form data
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const { companies, loadingCompanies } = useChecklistCompanies();
  
  // Import related state
  const [file, setFile] = useState<File | null>(null);
  
  // AI related state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType>("general");
  const [openAIAssistant, setOpenAIAssistant] = useState<string>("");
  
  // Question management
  const [questions, setQuestions] = useState<Array<{ text: string; type: string; required: boolean; allowPhoto: boolean; allowVideo: boolean; allowAudio: boolean; options?: string[]; hint?: string; weight?: number; parentId?: string; conditionValue?: string }>>([
    { text: "", type: "sim/não", required: true, allowPhoto: true, allowVideo: false, allowAudio: false }
  ]);
  
  // Submission handling
  const { isSubmitting, handleSubmit: formSubmitHandler } = useChecklistFormSubmit();
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('status', 'active')
          .order('name', { ascending: true });
          
        if (error) {
          console.error("Error fetching users:", error);
          toast.error("Erro ao carregar usuários");
          throw error;
        }
        
        setUsers(data || []);
      } catch (error) {
        console.error("Error in fetchUsers:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };
  
  // Clear selected file
  const clearFile = () => {
    setFile(null);
  };
  
  // Add a question
  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", type: "sim/não", required: true, allowPhoto: true, allowVideo: false, allowAudio: false }]);
  };
  
  // Remove a question
  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };
  
  // Update a question
  const handleQuestionChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };
  
  // Handle form submission - modified to accept adaptedForm parameter
  const submitForm = async (e: React.FormEvent, adaptedForm?: NewChecklistType): Promise<boolean> => {
    try {
      return await formSubmitHandler(
        e, 
        activeTab, 
        adaptedForm || form, // Use adaptedForm if provided, otherwise use the original form
        questions, 
        file, 
        aiPrompt, 
        openAIAssistant, 
        numQuestions
      );
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(`Error submitting form: ${error instanceof Error ? error.message : "Unknown error"}`);
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
    selectedAssistant,
    setSelectedAssistant,
    openAIAssistant,
    setOpenAIAssistant,
    questions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionChange,
    handleSubmit: submitForm,
    navigate,
    companies,
    loadingCompanies
  };
}
