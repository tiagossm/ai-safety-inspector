
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChecklistEditActions } from "@/components/new-checklist/edit/ChecklistEditActions";
import { LoadingState } from "@/components/new-checklist/edit/LoadingState";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { ChecklistEditorProvider } from "@/contexts/ChecklistEditorContext";
import { ChecklistHeader } from "@/components/new-checklist/edit/ChecklistHeader";
import { useChecklistEditorContext } from "@/hooks/new-checklist/useChecklistEditorContext";
import { ChecklistBasicInfo } from "./ChecklistBasicInfo";
import { ChecklistQuestionList } from "./ChecklistQuestionList";

export function ChecklistEditorContainer() {
  const editorContext = useChecklistEditorContext();
  const navigate = useNavigate();
  
  if (editorContext.isLoading) {
    return <LoadingState />;
  }
  
  // Context value with all state and actions
  const contextValue = {
    title: editorContext.title,
    description: editorContext.description,
    category: editorContext.category,
    isTemplate: editorContext.isTemplate,
    status: editorContext.status,
    questions: editorContext.questions,
    groups: editorContext.groups,
    viewMode: editorContext.viewMode,
    questionsByGroup: editorContext.questionsByGroup,
    nonEmptyGroups: editorContext.nonEmptyGroups,
    isSubmitting: editorContext.isSubmitting,
    enableAllMedia: editorContext.enableAllMedia,
    setTitle: editorContext.setTitle,
    setDescription: editorContext.setDescription,
    setCategory: editorContext.setCategory,
    setIsTemplate: editorContext.setIsTemplate,
    setStatus: editorContext.setStatus,
    setViewMode: editorContext.setViewMode,
    handleAddGroup: editorContext.handleAddGroup,
    handleUpdateGroup: editorContext.handleUpdateGroup,
    handleDeleteGroup: editorContext.handleDeleteGroup,
    handleAddQuestion: editorContext.handleAddQuestion,
    handleUpdateQuestion: editorContext.handleUpdateQuestion,
    handleDeleteQuestion: editorContext.handleDeleteQuestion,
    handleDragEnd: editorContext.handleDragEnd,
    handleSubmit: editorContext.handleSubmit,
    toggleAllMediaOptions: editorContext.toggleAllMediaOptions
  };
  
  return (
    <ChecklistEditorProvider value={contextValue}>
      <div className="space-y-6">
        {/* Header section */}
        <ChecklistHeader 
          onBack={() => navigate("/new-checklists")}
          onRefresh={() => editorContext.id && editorContext.refetch()}
          onStartInspection={editorContext.handleStartInspection}
          onSave={editorContext.handleSave}
        />
        
        {/* Form section */}
        <form onSubmit={(e) => {
          e.preventDefault();
          editorContext.handleSubmit();
        }} className="space-y-6">
          {/* Basic information section */}
          <ChecklistBasicInfo
            title={editorContext.title}
            description={editorContext.description}
            category={editorContext.category}
            isTemplate={editorContext.isTemplate}
            status={editorContext.status}
            onTitleChange={editorContext.setTitle}
            onDescriptionChange={editorContext.setDescription}
            onCategoryChange={editorContext.setCategory}
            onIsTemplateChange={editorContext.setIsTemplate}
            onStatusChange={editorContext.setStatus}
          />
          
          {/* Questions section */}
          <ChecklistQuestionList />
          
          {/* Bottom actions */}
          <ChecklistEditActions
            isSubmitting={editorContext.isSubmitting}
            onCancel={() => navigate("/new-checklists")}
            onStartInspection={editorContext.handleStartInspection}
            onSave={editorContext.handleSave}
          />
        </form>
        
        <FloatingNavigation threshold={400} />
      </div>
    </ChecklistEditorProvider>
  );
}
