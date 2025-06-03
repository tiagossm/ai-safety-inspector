
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChecklistEditorProvider } from "@/contexts/ChecklistEditorContext";
import { useChecklistEditorContext } from "@/hooks/new-checklist/useChecklistEditorContext";
import { ChecklistEditorContainer } from "@/components/new-checklist/edit/ChecklistEditorContainer";
import { ChecklistLoadingState } from "@/components/new-checklist/details/ChecklistLoadingState";
import { ChecklistErrorState } from "@/components/new-checklist/details/ChecklistErrorState";

function ChecklistEditPage() {
  const editorContext = useChecklistEditorContext();
  const navigate = useNavigate();

  if (editorContext.isLoading) {
    return <ChecklistLoadingState />;
  }

  if (editorContext.error) {
    return (
      <ChecklistErrorState 
        error={editorContext.error instanceof Error ? editorContext.error : new Error(String(editorContext.error))} 
        onRetry={() => navigate("/new-checklists")} 
      />
    );
  }

  return (
    <ChecklistEditorProvider value={editorContext}>
      <ChecklistEditorContainer />
    </ChecklistEditorProvider>
  );
}

export default function NewChecklistEdit() {
  return <ChecklistEditPage />;
}
