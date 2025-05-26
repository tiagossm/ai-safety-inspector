
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChecklistEditorContainer } from "@/components/new-checklist/edit/ChecklistEditorContainer";
import { ChecklistErrorState } from "@/components/new-checklist/details/ChecklistErrorState";
import { useChecklistById } from "@/hooks/new-checklist/useChecklistById";
import { useChecklistEditorContext } from "@/hooks/new-checklist/useChecklistEditorContext"; 
import { ChecklistEditorProvider } from "@/contexts/ChecklistEditorContext";
import { toast } from "sonner";

export default function NewChecklistEdit() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  const { checklist, loading, error, refetch } = useChecklistById(id || "");
  const editorContext = useChecklistEditorContext();
  
  const handleCancel = () => {
    navigate("/new-checklists");
  };

  if (error) {
    return (
      <ChecklistErrorState 
        error={new Error(typeof error === 'string' ? error : 'Erro desconhecido')} 
        onRetry={() => refetch()} 
      />
    );
  }

  // Se não há contexto disponível, renderize o container diretamente
  if (!editorContext) {
    return <ChecklistEditorContainer />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {id ? "Editar Checklist" : "Criar Novo Checklist"}
        </h1>
      </div>
      
      <ChecklistEditorContainer />
    </div>
  );
}
