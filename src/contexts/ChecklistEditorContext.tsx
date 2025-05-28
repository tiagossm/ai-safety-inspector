import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { ChecklistQuestion, ChecklistGroup } from "@/types/checklist";
import { validateQuestion } from "@/validation/checklistValidation";

export interface ChecklistEditorContextType {
  // State
  id?: string;
  title: string;
  description: string;
  category: string;
  isTemplate: boolean;
  status: "active" | "inactive";
  questions: ChecklistQuestion[];
  groups: ChecklistGroup[];
  viewMode: "flat" | "grouped";
  questionsByGroup: Map<string, ChecklistQuestion[]>;
  nonEmptyGroups: ChecklistGroup[];
  isSubmitting: boolean;
  isLoading: boolean;
  enableAllMedia: boolean;
  
  // Actions
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setCategory: (category: string) => void;
  setIsTemplate: (isTemplate: boolean) => void;
  setStatus: (status: "active" | "inactive") => void;
  setViewMode: (viewMode: "flat" | "grouped") => void;
  handleAddGroup: () => void;
  handleUpdateGroup: (group: ChecklistGroup) => void;
  handleDeleteGroup: (groupId: string) => void;
  handleAddQuestion: (groupId: string) => void;
  handleUpdateQuestion: (question: ChecklistQuestion) => void;
  handleDeleteQuestion: (questionId: string) => void;
  handleDragEnd: (result: any) => void;
  handleSubmit: () => Promise<boolean>;
  handleSave?: () => Promise<boolean>;
  toggleAllMediaOptions: (enabled: boolean) => void;
  refetch?: () => void;
  
  // Validation helpers
  validateQuestion: (question: ChecklistQuestion) => boolean;
  getQuestionErrors: (question: ChecklistQuestion) => Record<string, string[]> | null;
  isFormValid: () => boolean;
}

const ChecklistEditorContext = createContext<ChecklistEditorContextType | undefined>(undefined);

export const useChecklistEditor = () => {
  const context = useContext(ChecklistEditorContext);
  if (!context) {
    throw new Error("useChecklistEditor must be used within a ChecklistEditorProvider");
  }
  return context;
};

interface ChecklistEditorProviderProps {
  children: ReactNode;
  value: Omit<ChecklistEditorContextType, 'validateQuestion' | 'getQuestionErrors' | 'isFormValid'>;
}

export const ChecklistEditorProvider: React.FC<ChecklistEditorProviderProps> = ({ 
  children, 
  value 
}) => {
  // Adiciona funções de validação ao contexto
  const enhancedValue = useMemo(() => {
    const validateQuestionFn = (question: ChecklistQuestion): boolean => {
      const result = validateQuestion(question);
      return result.valid;
    };

    const getQuestionErrorsFn = (question: ChecklistQuestion): Record<string, string[]> | null => {
      const result = validateQuestion(question);
      return result.errors;
    };

    const isFormValidFn = (): boolean => {
      if (!value.title.trim()) return false;
      if (!value.category.trim()) return false;
      if (value.questions.length === 0) return false;
      
      // Verifica se todas as perguntas são válidas
      for (const question of value.questions) {
        if (!validateQuestionFn(question)) return false;
      }
      
      return true;
    };

    return {
      ...value,
      validateQuestion: validateQuestionFn,
      getQuestionErrors: getQuestionErrorsFn,
      isFormValid: isFormValidFn
    };
  }, [value]);

  return (
    <ChecklistEditorContext.Provider value={enhancedValue}>
      {children}
    </ChecklistEditorContext.Provider>
  );
};
