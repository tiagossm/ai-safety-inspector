
import React from "react";
import { NewChecklist } from "@/types/checklist";
import { BasicInfoSection } from "./BasicInfoSection";
import { QuestionsSection } from "./QuestionsSection";
import { CompanyListItem } from "@/types/CompanyListItem";

interface ManualCreateFormProps {
  form: NewChecklist;
  setForm: React.Dispatch<React.SetStateAction<NewChecklist>>;
  users: any[];
  loadingUsers: boolean;
  questions: Array<{
    text: string;
    type: string;
    required: boolean;
    allowPhoto: boolean;
    allowVideo: boolean;
    allowAudio: boolean;
    options?: string[];
    hint?: string;
    weight?: number;
    parentId?: string;
    conditionValue?: string;
  }>;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onQuestionChange: (index: number, field: string, value: string | boolean) => void;
  companies: CompanyListItem[];
  loadingCompanies: boolean;
}

export function ManualCreateForm({
  form,
  setForm,
  users,
  loadingUsers,
  questions,
  onAddQuestion,
  onRemoveQuestion,
  onQuestionChange,
  companies,
  loadingCompanies
}: ManualCreateFormProps) {
  return (
    <div className="space-y-6">
      <BasicInfoSection
        form={form}
        setForm={setForm}
        users={users}
        loadingUsers={loadingUsers}
        companies={companies}
        loadingCompanies={loadingCompanies}
      />

      <QuestionsSection
        questions={questions}
        onAddQuestion={onAddQuestion}
        onRemoveQuestion={onRemoveQuestion}
        onQuestionChange={onQuestionChange}
      />
    </div>
  );
}
