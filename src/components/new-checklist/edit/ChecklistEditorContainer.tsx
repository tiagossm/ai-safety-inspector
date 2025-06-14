
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChecklistEditActions } from "@/components/new-checklist/edit/ChecklistEditActions";
import { LoadingState } from "@/components/new-checklist/edit/LoadingState";
import { FloatingNavigation } from "@/components/ui/FloatingNavigation";
import { ChecklistEditorProvider } from "@/contexts/ChecklistEditorContext";
import { ChecklistHeader } from "@/components/new-checklist/edit/ChecklistHeader";
import { useChecklistEditorContext } from "@/hooks/new-checklist/useChecklistEditorContext";
import { ChecklistBasicInfo } from "./ChecklistBasicInfo";
import { ChecklistQuestionList } from "./ChecklistQuestionList";
import { toast } from "sonner";
import { ChecklistQuestion } from "@/types/newChecklist";

export function ChecklistEditorContainer() {
  const editorContext = useChecklistEditorContext();
  const navigate = useNavigate();
  
  if (!editorContext) {
    return <LoadingState />;
  }
  
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
    toggleAllMediaOptions: editorContext.toggleAllMediaOptions,
    id: editorContext.id,
  };
  
  // Enhanced save handler to provide feedback and navigate after success
  const handleSave = async (): Promise<void> => {
    try {
      toast.info("Salvando checklist...", { duration: 2000 });
      if (editorContext.handleSave) {
        const success = await editorContext.handleSave();
        if (success) {
          toast.success("Checklist salvo com sucesso!", { duration: 5000 });
          navigate("/new-checklists");
        } else {
          toast.error("Erro ao salvar checklist", { duration: 5000 });
        }
      }
    } catch (error) {
      console.error("Error saving checklist:", error);
      toast.error(`Erro ao salvar checklist: ${error instanceof Error ? error.message : "Erro desconhecido"}`, { duration: 5000 });
    }
  };

  // The local handleStartInspection is removed. We'll use the one from context.
  
  return (
    <ChecklistEditorProvider value={contextValue}>
      <div className="space-y-6">
        {/* Header section with question counter */}
        <ChecklistHeader 
          totalQuestions={editorContext.questions.length}
          totalGroups={editorContext.nonEmptyGroups.length}
          onBack={() => navigate("/new-checklists")}
          onRefresh={() => {
            if (editorContext.id) {
              toast.info("Recarregando dados...", { duration: 2000 });
              if (editorContext.refetch) {
                editorContext.refetch();
              }
            }
          }}
          onStartInspection={editorContext.handleStartInspection}
          onSave={handleSave}
        />
        
        {/* Main content without tabs */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSave();
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
            onSave={handleSave}
          />
        </form>
        
        <FloatingNavigation threshold={400} />
      </div>
    </ChecklistEditorProvider>
  );
}
