
import React from "react";
import { useChecklistEditor } from "@/contexts/ChecklistEditorContext";
import { ChecklistBasicInfo } from "@/components/new-checklist/edit/ChecklistBasicInfo";
import { ChecklistQuestionList } from "@/components/new-checklist/edit/ChecklistQuestionList";
import { ChecklistEditActions } from "@/components/new-checklist/edit/ChecklistEditActions";
import { useNavigate } from "react-router-dom";

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
    handleSubmit
  } = useChecklistEditor();
  
  const navigate = useNavigate();
  
  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
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
      
      {/* Bottom actions - Get other handlers from context */}
      <ChecklistEditActions
        isSubmitting={isSubmitting}
        onCancel={() => navigate("/new-checklists")}
      />
    </form>
  );
}
