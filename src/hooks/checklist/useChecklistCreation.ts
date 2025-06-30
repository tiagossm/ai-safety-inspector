
import { useState } from "react";
import { NewChecklist } from "@/types/checklist";
import { useChecklistUsers } from "./form/useChecklistUsers";
import { useChecklistCompanies } from "./form/useChecklistCompanies";
import { useChecklistFormSubmit } from "./form/useChecklistFormSubmit";

export function useChecklistCreation() {
  const [form, setForm] = useState<NewChecklist>({
    title: "",
    description: "",
    is_template: false,
    status_checklist: "ativo",
    category: "",
    company_id: null,
    responsible_id: null
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [openAIAssistant, setOpenAIAssistant] = useState("");
  
  const [questions, setQuestions] = useState([
    {
      text: "",
      type: "sim/não",
      required: true,
      allowPhoto: false,
      allowVideo: false,
      allowAudio: false,
      options: [] as string[],
      hint: "",
      weight: 1,
      parentId: "",
      conditionValue: ""
    }
  ]);

  const { users, isLoading: loadingUsers } = useChecklistUsers();
  const { companies, loadingCompanies } = useChecklistCompanies();
  const { isSubmitting, handleSubmit: handleFormSubmit } = useChecklistFormSubmit();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "sim/não",
        required: true,
        allowPhoto: false,
        allowVideo: false,
        allowAudio: false,
        options: [] as string[],
        hint: "",
        weight: 1,
        parentId: "",
        conditionValue: ""
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleQuestionChange = (index: number, field: string, value: string | boolean) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent, activeTab: string = "manual"): Promise<boolean> => {
    return await handleFormSubmit(
      e,
      activeTab,
      form,
      questions,
      file,
      aiPrompt,
      openAIAssistant,
      numQuestions
    );
  };

  return {
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
    questions,
    handleAddQuestion,
    handleRemoveQuestion,
    handleQuestionChange,
    handleSubmit,
    aiPrompt,
    setAiPrompt,
    numQuestions,
    setNumQuestions,
    openAIAssistant,
    setOpenAIAssistant
  };
}
