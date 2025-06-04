
import React from "react";
import { ChecklistEditor } from "@/components/checklists/ChecklistEditor";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingState } from "@/components/checklist/editor/LoadingState";
import { ErrorState } from "@/components/checklist/editor/ErrorState";
import { EmptyState } from "@/components/checklist/editor/EmptyState";
import { useLoadChecklistData } from "@/hooks/checklist/useLoadChecklistData";

export default function ChecklistEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { loading, error, editorData } = useLoadChecklistData();

  const handleSave = (checklistId: string) => {
    sessionStorage.removeItem("checklistEditorData");

    if (editorData?.mode !== "edit") {
      // Ensure checklistId is valid before navigation
      if (!checklistId) {
        toast.error("Erro: ID do checklist inválido");
        return;
      }
      
      // Log the redirection for debugging
      console.log(`Redirecionando para inspeção com ID: ${checklistId}`);
      
      // Redireciona para a nova tela de iniciar inspeção
      navigate(`/inspections/redirect/${checklistId}`);
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
