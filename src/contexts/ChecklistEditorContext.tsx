import React, { createContext, useContext, ReactNode } from "react";
import { ChecklistQuestion, ChecklistGroup } from "@/types/newChecklist";

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
  value: ChecklistEditorContextType;
}

export const ChecklistEditorProvider: React.FC<ChecklistEditorProviderProps> = ({ 
  children, 
  value 
}) => {
  return (
    <ChecklistEditorContext.Provider value={value}>
      {children}
    </ChecklistEditorContext.Provider>
  );
};
