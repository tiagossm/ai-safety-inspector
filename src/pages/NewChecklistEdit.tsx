
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

export default function NewChecklistEdit() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "standard";
  const [editorMode, setEditorMode] = React.useState<"standard" | "wizard">(mode as "standard" | "wizard");
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  // Get checklist data if it exists
  const { data: checklist, isLoading, error, refetch } = useChecklistById(id || "");
  const editorContext = useChecklistEditorContext();
  
  // Handlers for accessibility wrapper
  const handleSave = async () => {
    if (editorMode === "standard" && editorContext) {
      return editorContext.handleSave();
    }
    // For wizard mode, we'll implement this later
    return Promise.resolve();
  };
  
  const handleAddQuestion = () => {
    if (editorMode === "standard" && editorContext) {
      editorContext.handleAddQuestion("default");
    }
  };
  
  const handleCancel = () => {
    navigate("/new-checklists");
  };

  // If there's an error fetching the checklist, show error state
  if (error) {
    return (
      <ChecklistErrorState 
        error={error as Error} 
        onRetry={() => refetch()} 
      />
    );
  }

  // Create a fixed context value for the wizard mode to prevent the context error
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
      <Tabs 
        value={editorMode} 
        onValueChange={(value) => setEditorMode(value as "standard" | "wizard")}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">
            {id ? "Editar Checklist" : "Criar Novo Checklist"}
          </h1>
          <TabsList>
            <TabsTrigger value="standard">Editor Padrão</TabsTrigger>
            <TabsTrigger value="wizard">Modo Assistente</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="standard" className="mt-0">
          <AccessibleEditor 
            onSave={handleSave}
            onAddQuestion={handleAddQuestion}
            onCancel={handleCancel}
            isSubmitting={false}
          >
            <ChecklistEditorContainer />
          </AccessibleEditor>
        </TabsContent>
        
        <TabsContent value="wizard" className="mt-0">
          <ChecklistEditorProvider value={wizardContextValue}>
            <AccessibleEditor 
              onSave={handleSave}
              onAddQuestion={handleAddQuestion}
              onCancel={handleCancel}
              isSubmitting={false}
            >
              <ChecklistWizard />
            </AccessibleEditor>
          </ChecklistEditorProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
}
