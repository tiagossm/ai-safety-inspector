
import React from "react";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { ChecklistBasicInfo } from "@/components/new-checklist/edit/ChecklistBasicInfo";
import { ChecklistQuestionList } from "@/components/new-checklist/edit/ChecklistQuestionList";
import { ChecklistEditActions } from "@/components/new-checklist/edit/ChecklistEditActions";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function ChecklistEditorForm() {
  const {
    title,
    description,
    category,
    isTemplate,
    status,
    isSubmitting,
    setTitle,
    setDescription,
    setCategory,
    setIsTemplate,
    setStatus,
    handleSubmit,
    id
  } = useChecklistEditor();
  
  const navigate = useNavigate();
  
  const handleSave = async () => {
    try {
      const success = await handleSubmit();
      if (success) {
        toast.success("Checklist salvo com sucesso!");
        navigate("/new-checklists");
      }
    } catch (error) {
      console.error("Erro ao salvar checklist:", error);
      toast.error("Erro ao salvar checklist");
    }
  };

  const handleStartInspection = () => {
    if (!id) {
      toast.error("É necessário salvar o checklist antes de iniciar a inspeção");
      return;
    }
    navigate(`/inspections/new?checklistId=${id}`);
  };
  
  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }} 
      className="space-y-6"
    >
      {/* Basic information section */}
      <ChecklistBasicInfo
        title={title}
        description={description}
        category={category}
        isTemplate={isTemplate}
        status={status}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onCategoryChange={setCategory}
        onIsTemplateChange={setIsTemplate}
        onStatusChange={setStatus}
      />
      
      {/* Questions section */}
      <ChecklistQuestionList />
      
      {/* Bottom actions */}
      <ChecklistEditActions
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/new-checklists")}
        onStartInspection={handleStartInspection}
        onSave={handleSave}
      />
    </form>
  );
}
