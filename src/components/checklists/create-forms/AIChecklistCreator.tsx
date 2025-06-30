
import React, { useState } from "react";
import { NewChecklist } from "@/types/checklist";
import { CompanyListItem } from "@/types/CompanyListItem";
import { AICreateForm } from "./AICreateForm";
import { FormActions } from "./FormActions";
import { useNavigate } from "react-router-dom";
import { useOpenAIAssistants } from "@/hooks/new-checklist/useOpenAIAssistants";

interface AIChecklistCreatorProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  companies: CompanyListItem[];
  loadingCompanies: boolean;
}

export function AIChecklistCreator({
  form,
  setForm,
  onSubmit,
  isSubmitting,
  companies,
  loadingCompanies
}: AIChecklistCreatorProps) {
  const navigate = useNavigate();
  const [aiPrompt, setAiPrompt] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [selectedAssistant, setSelectedAssistant] = useState("general");
  const [openAIAssistant, setOpenAIAssistant] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  
  const { assistants, loading: loadingAssistants } = useOpenAIAssistants();

  const handleGenerateAI = async (attachedFile?: File | null) => {
    setAiLoading(true);
    try {
      const event = new Event('submit') as any;
      await onSubmit(event);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AICreateForm
        form={form}
        setForm={setForm}
        users={[]}
        loadingUsers={false}
        companies={companies}
        loadingCompanies={loadingCompanies}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        onGenerateAI={handleGenerateAI}
        aiLoading={aiLoading}
        selectedAssistant={selectedAssistant}
        setSelectedAssistant={setSelectedAssistant}
        openAIAssistant={openAIAssistant}
        setOpenAIAssistant={setOpenAIAssistant}
        assistants={assistants}
        loadingAssistants={loadingAssistants}
      />

      <FormActions
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/checklists")}
        canSubmit={!!form.category && !!form.company_id && !!openAIAssistant}
        submitText="Gerar com IA"
      />
    </form>
  );
}
