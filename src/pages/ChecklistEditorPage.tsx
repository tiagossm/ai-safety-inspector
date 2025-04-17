
import React from "react";
import { ChecklistEditor } from "@/components/checklists/ChecklistEditor";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoadingState } from "@/components/checklist/editor/LoadingState";
import { ErrorState } from "@/components/checklist/editor/ErrorState";
import { EmptyState } from "@/components/checklist/editor/EmptyState";
import { useLoadChecklistData } from "@/hooks/checklist/useLoadChecklistData";

export default function ChecklistEditorPage() {
  const navigate = useNavigate();
  const { loading, error, editorData } = useLoadChecklistData();

  const handleSave = (checklistId: string) => {
    sessionStorage.removeItem("checklistEditorData");
    if (editorData?.mode !== "edit") {
      navigate(`/inspections/start/${checklistId}`);
    } else {
      toast.success("Checklist atualizado com sucesso!");
      navigate("/checklists");
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem("checklistEditorData");
    navigate("/checklists");
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!editorData) {
    return <EmptyState />;
  }

  return (
    <ChecklistEditor
      initialChecklist={editorData.checklistData}
      initialQuestions={editorData.questions || []}
      initialGroups={editorData.groups || []}
      mode={editorData.mode || "create"}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
