
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChecklistEditorContainer } from "@/components/new-checklist/edit/ChecklistEditorContainer";
import { ChecklistWizard } from "@/components/new-checklist/edit/ChecklistWizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessibleEditor } from "@/components/new-checklist/edit/AccessibleEditor";
import { useParams, useNavigate } from "react-router-dom";
import { ChecklistErrorState } from "@/components/new-checklist/details/ChecklistErrorState";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { useChecklistEditorContext } from "@/hooks/new-checklist/useChecklistEditorContext"; 
import { ChecklistEditorProvider } from "@/contexts/ChecklistEditorContext";
import { ChecklistEditorContextType } from "@/contexts/ChecklistEditorContext";
import { toast } from "sonner";

export default function NewChecklistEdit() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "standard";
  const [editorMode, setEditorMode] = React.useState<"standard" | "wizard">("standard");
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  const { checklist, isLoading, error, refetch } = useChecklistById(id || "");
  const editorContext = useChecklistEditorContext();
  
  const handleSave = async (): Promise<void> => {
    if (editorMode === "standard" && editorContext) {
      try {
        toast.info("Salvando checklist...");
        const success = await editorContext.handleSave();
        if (success) {
          toast.success("Checklist salvo com sucesso!");
        } else {
          toast.error("Erro ao salvar checklist");
        }
      } catch (error) {
        console.error("Error saving checklist:", error);
        toast.error(`Erro ao salvar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      }
    }
  };
  
  const handleAddQuestion = () => {
    if (editorMode === "standard" && editorContext) {
      editorContext.handleAddQuestion("default");
    }
  };
  
  const handleCancel = () => {
    navigate("/new-checklists");
  };

  if (error) {
    return (
      <ChecklistErrorState 
        error={error instanceof Error ? error : new Error(String(error))} 
        onRetry={() => refetch()} 
      />
    );
  }

  const wizardContextValue: ChecklistEditorContextType = {
    title: checklist?.title || "",
    description: checklist?.description || "",
    category: checklist?.category || "",
    isTemplate: checklist?.isTemplate || false,
    status: checklist?.status === "inactive" ? "inactive" : "active",
    questions: [],
    groups: [],
    viewMode: "flat" as "flat" | "grouped",
    questionsByGroup: new Map(),
    nonEmptyGroups: [],
    isSubmitting: false,
    enableAllMedia: false,
    setTitle: () => {},
    setDescription: () => {},
    setCategory: () => {},
    setIsTemplate: () => {},
    setStatus: () => {},
    setViewMode: () => {},
    handleAddGroup: () => {},
    handleUpdateGroup: () => {},
    handleDeleteGroup: () => {},
    handleAddQuestion: () => {},
    handleUpdateQuestion: () => {},
    handleDeleteQuestion: () => {},
    handleDragEnd: () => {},
    handleSubmit: async () => false,
    toggleAllMediaOptions: () => {}
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {id ? "Editar Checklist" : "Criar Novo Checklist"}
        </h1>
      </div>
      
      <AccessibleEditor 
        onSave={handleSave}
        onAddQuestion={handleAddQuestion}
        onCancel={handleCancel}
        isSubmitting={false}
      >
        <ChecklistEditorContainer />
      </AccessibleEditor>
    </div>
  );
}
