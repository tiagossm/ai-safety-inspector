
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NewChecklist } from "@/types/checklist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChecklistSubmit } from "./form/useChecklistSubmit";
import { useOpenAIAssistants } from "@/hooks/useOpenAIAssistants";
import { CompanyListItem } from "@/types/CompanyListItem";

export type AIAssistantType = 'general' | 'workplace-safety' | 'compliance' | 'quality';

export function useChecklistCreation() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("manual");
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
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(true);
  
  // Import related state
  const [file, setFile] = useState<File | null>(null);
  
  // AI related state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType>("general");
  const [openAIAssistant, setOpenAIAssistant] = useState<string>("");
  
  // Get OpenAI assistants
  const { assistants, loading: loadingAssistants } = useOpenAIAssistants();
  
  // Question management
  const [questions, setQuestions] = useState<Array<{ text: string; type: string; required: boolean; allowPhoto: boolean; allowVideo: boolean; allowAudio: boolean; options?: string[]; hint?: string; weight?: number; parentId?: string; conditionValue?: string }>>([
    { text: "", type: "sim/não", required: true, allowPhoto: true, allowVideo: false, allowAudio: false }
  ]);
  
  // Submission handling
  const { isSubmitting, handleSubmit: submitForm } = useChecklistSubmit();
  
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
  
  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        
        const { data, error } = await supabase
          .from('companies')
          .select('id, fantasy_name')
          .eq('status', 'active')
          .order('fantasy_name', { ascending: true });
          
        if (error) {
          console.error("Error fetching companies:", error);
          toast.error("Erro ao carregar empresas");
          throw error;
        }
        
        setCompanies(data || []);
      } catch (error) {
        console.error("Error in fetchCompanies:", error);
      } finally {
        setLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, []);
  
  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
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
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    return await submitForm(e, activeTab, form, questions, file, aiPrompt);
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
    assistants,
    loadingAssistants,
    questions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionChange,
    handleSubmit,
    navigate,
    companies,
    loadingCompanies
  };
}
