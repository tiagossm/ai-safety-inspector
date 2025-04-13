
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChecklistEditorContainer } from "@/components/new-checklist/edit/ChecklistEditorContainer";
import { ChecklistWizard } from "@/components/new-checklist/edit/ChecklistWizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChecklistEditorProvider } from "@/contexts/ChecklistEditorContext";
import { AccessibleEditor } from "@/components/new-checklist/edit/AccessibleEditor";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { useParams, useNavigate } from "react-router-dom";

export default function NewChecklistEdit() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "standard";
  const [editorMode, setEditorMode] = useState<"standard" | "wizard">(mode as "standard" | "wizard");
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  // Get checklist data if it exists
  const { data: checklist, isLoading } = useChecklistById(id || "");
  
  // Handlers for accessibility wrapper
  const handleSave = async () => {
    // This will be provided by the context
    return Promise.resolve();
  };
  
  const handleAddQuestion = () => {
    // This will be provided by the context
  };
  
  const handleCancel = () => {
    navigate("/new-checklists");
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
          <AccessibleEditor 
            onSave={handleSave}
            onAddQuestion={handleAddQuestion}
            onCancel={handleCancel}
            isSubmitting={false}
          >
            <ChecklistWizard />
          </AccessibleEditor>
        </TabsContent>
      </Tabs>
    </div>
  );
}
